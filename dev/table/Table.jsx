import './style.scss';
import React from 'react';
import {
    binds, JX, ut, dvc,
} from 'fmihel-browser-lib';
import Head from './Head.jsx';
import Body from './Body.jsx';

export default class Table extends React.Component {
    constructor(p) {
        super(p);
        binds(this, 'onWheel', 'onScroll');
        this.state = {
            start: 0,
            count: this.props.count,

        };
        this.scrollTo = false;

        this.scrollLock = false;
        this.last = undefined;
    }

    /**
     * обработка скролинга колесиком мышки или пальцем на мобильном
     *
    */
    onScroll() {
        if (this.scrollLock) return;
        this.lockScroll();


        const $owner = this.$body;
        const scrollTop = $owner.scrollTop();

        if (scrollTop === 0) {
            // доскролили до первого отображаемого элемента
            this.setState((state, props) => {
                const newState = {};
                if (state.start > 0) {
                    const tr = $owner.find('tr:first-child')[0]; // последний отображаемый элемент
                    const p = JX.abs(tr).y - JX.abs($owner[0]).y;// величина отступа последнего элемента от края отображаемой области
                    const delta = state.start - props.delta < 0 ? state.start : props.delta; // велчина
                    const num = delta > 0 ? delta - props.offUp : 0; // для текущего первого элемента, расчитываем какой у него будет новый номер, после того как будет произведен пересчет границ отображения
                    this.last = {
                        event: 'top',
                        p,
                        num,
                    };
                    newState.start = state.start - delta;
                } else {
                    this.unLockScroll();
                }
                return newState;
            });
        } else if (scrollTop >= $owner[0].scrollHeight - $owner[0].offsetHeight) {
            // доскролили до последнего отображаемого элемента
            this.setState((state, props) => {
                const newState = {};
                if (state.start + props.count < props.data.length) {
                    const tr = $owner.find('tr:last-child')[0]; // последний отображаемый элемент
                    const p = JX.abs(tr).y - JX.abs($owner[0]).y;// отступ последнего элемента от края отображаемой области
                    const num = props.count - props.delta - (props.offDown + 1);// для текущего последнего элемента, расчитываем какой у него будет новый номер, после того как будет произведен пересчет границ отображения

                    this.last = {
                        event: 'bottom',
                        p,
                        num,
                    };

                    newState.start = state.start + props.delta;
                } else {
                    this.unLockScroll();
                }
                return newState;
            });
        } else {
            this.unLockScroll();
        }
    }

    lockScroll() {
        this.scrollLock = true;
    }

    onWheel(o) {
        if (!dvc.mobile) {
            const delta = Math.sign(o.deltaY) * this.props.mouseDelta;
            this.$body.scrollTop(this.$body.scrollTop() + delta);
        }
    }

    /** действие при изменении размеров родительской области, приходится вызывать по нескольку раз
     * т.к. координаты не всегда пересчитываются синхронно, толи это связанос со  спецификой html отображения
     * толи с react
    */
    onScreenResize() {
        this.align();
        this.align();
        setTimeout(() => {
            this.align();
            this.align();
        }, 5);
    }

    /**
    * алгоритм выравнивания колонок заголовка под колонки данных,
    * а также выравннивание высоты таблицы по высоте родительского компонента
    */
    align() {
        this.$body.height(this.$parent.height() - this.$head.height());
        const cols = this.$body.find('tr:first-child td');
        const ths = this.$head.find('tr:first-child th');
        const width = this.$self.width();
        const widthCol = width / cols.length;
        $.each(cols, (i) => {
            const col = cols.eq(i);
            const th = ths.eq(i);
            col.width(widthCol);
            if (i < cols.length - 1) {
                th.width(col.width());
            }
        });
    }

    unLockScroll() {
        this.scrollLock = false;
    }

    /**
     * вычисляет ближайший интервал отображения для произвольно заданного start
    */
    culcOff(start) {
        if (start === 0) {
            return {
                start, n: 0, min: 0, max: this.props.count - 1,
            };
        }
        const count = Math.trunc(this.props.data.length / this.props.delta);
        let min = 0;
        let max = this.props.count - 1;
        let i = 0;
        for (i = 0; i < count; i++) {
            if ((min <= start) && (start <= max)) {
                break;
            }
            min += this.props.delta;
            max += this.props.delta;
        }
        return {
            start: min, n: i, min, max,
        };
    }

    /**
    * скроллирует
    * внешний объект o.scroll:jQuery,
    * до момента, пока
    * o.target:jQuery не окажется в области видимости
    * alg - тип алгоритма
    * alg = "simple" - просто смещает target так что бы верхняя граница совпадала с верхней границей scroll
    * alg = "reach"  - target по наиболее короткому расстоянию от текущего сместиться в область видимости scroll
    *
    *
    */
    scroll(o) {
        const a = $.extend(true, {
            scroll: null,
            target: null,
            animate: this.props.animate,
            off: 0,
            alg: 'simple', /* reach */
        }, o);
        const posTar = JX.abs(a.target[0]);
        const posScr = JX.abs(a.scroll[0]);
        let delta;

        if (a.alg === 'reach') {
            if ((posTar.h > posScr.h) || (posTar.y < posScr.y)) {
                delta = posTar.y - posScr.y + a.scroll.scrollTop() - a.off;
            } else {
                delta = posTar.y - (posScr.y + posScr.h - posTar.h) + a.scroll.scrollTop() + a.off;
            }
        } else {
            delta = posTar.y - posScr.y + a.scroll.scrollTop() - a.off;
        }


        if (a.animate > 0) {
            this.lockScroll();
            a.scroll.animate({ scrollTop: delta }, a.animate, 'swing', () => {
                this.unLockScroll();
            });
        } else {
            a.scroll.scrollTop(delta);
        }
    }


    componentDidMount() {
        if (!this.$owner) {
            this.$self = $(`#${this.props.id}`);
            this.$head = this.$self.find('thead');
            this.$body = this.$self.find('tbody');
            this.$parent = this.$self.parent();
            this.$body.scroll(this.onScroll);
            this.resizeObserver = new ResizeObserver((o) => {
                this.onScreenResize();
            });
            this.resizeObserver.observe(this.$parent[0]);
        }
        // JX.window.on('resize', () => {
        //    // this.onScreenResize();
        // });

        this.componentDidUpdate();
    }

    componentWillUnmount() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }


    componentDidUpdate() {
        if (this.last) {
            const tr = this.$body.find('tr').eq(this.last.num)[0];
            const scroll = JX.pos(tr).y - this.last.p;
            this.$body.scrollTop(scroll);
            // setTimeout(() => {
            this.unLockScroll();
            // }, 100);
            this.last = undefined;
        }


        if (Number.isInteger(this.props.moveTo) && (this.props.moveTo !== this.prevMoveTo) && (this.props.moveTo < this.props.data.length)) {
            this.prevMoveTo = this.props.moveTo;
            const off = this.culcOff(this.props.moveTo); // рассчитываем интервал отображения
            this.scrollTo = this.props.moveTo - off.min; // номер элемента в отображаемом интервале, который соотвесвует реальному номера ( его нужно поместить в область видимости)
            this.setState({ start: off.start }); // задаем новый первый элемент
        } else
        if (this.scrollTo !== false) {
            this.scroll({
                scroll: this.$body,
                target: this.$body.find('tr').eq(this.scrollTo),
            });
            this.scrollTo = false;
        } else {
            this.onScreenResize();
        }
    }

    render() {
        const {
            data, light, id, css,
        } = this.props;
        const { start } = this.state;

        const { count } = this.props;

        let outData;
        if ((count > 0) && (count <= data.length)) {
            const from = start < 0 ? 0 : start;
            const to = (from + count >= data.length ? data.length : (from + count));
            outData = data.slice(from, to);
        } else {
            outData = data;
        }
        return (
            <table
                id={id}
                onWheel={this.onWheel}
                className={`table ${css} ${light ? '' : ' table-dark'} table-head-fixed `}
            >
                <Head {...this.props}/>
                <Body {...this.props} data={outData} />
            </table>
        );
    }
}
Table.defaultProps = {
    id: ut.random_str(10),
    light: true,
    keyField: false,
    css: '',
    fields: [
        { name: 'ID' },
        { name: 'NAME', caption: ' name of client' },
    ],
    data: [
        { ID: 1, NAME: 'Mike' },
        { ID: 2, NAME: 'Soma' },
        { ID: 3, NAME: 'Tomy' },
    ],
    onDrawRow: undefined,

    count: 30, // кол-во отображаемых записей
    moveTo: false, // скролинг на необходимую запись
    delta: 10, // кол-во записей, добавляемых и вычитаемых, при достижении крайних записей
    offUp: 1, // смещение номера записи на которую идет позиционирование, при скролинге вверх
    offDown: 0, // смещение номер записи на которую идет позиционирование при движении вниз
    mouseDelta: 30, // минимальнный скролинг при минимальном обороте колесика мыши
    animate: 0,
};
