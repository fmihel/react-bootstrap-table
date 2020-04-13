import './style.scss';
import React, { Fragment } from 'react';
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
            start: this.props.start,
            count: this.props.count,
        };
        this.scrollLock = false;
        this.last = undefined;
    }


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
            // redux.actions.debug({ deltaY: o.deltaY });
            const delta = Math.sign(o.deltaY) * this.props.mouseDelta;
            this.$body.scrollTop(this.$body.scrollTop() + delta);
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

    onScreenResize() {
        this.align();
        this.align();
        setTimeout(() => {
            this.align();
            this.align();
        }, 5);
    }

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
        this.onScreenResize();
    }

    unLockScroll() {
        this.scrollLock = false;
    }

    render() {
        const {
            data, light, id,
        } = this.props;
        const css = Array.isArray(this.props.css) ? this.props.css.join(' ') : this.props.css;
        const { start } = this.state;
        const { count } = this.props;

        let outData;
        if ((count > 0) && (count <= data.length)) {
            let from = start;
            if (start < 0) {
                from = 0;
            }
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

    count: 100, // кол-во отображаемых записей
    start: 0, // с какой записи начать отображение
    delta: 20, // кол-во записей, добавляемых и вычитаемых, при достижении крайних записей
    offUp: 1, // смещение номера записи на которую идет позиционирование, при скролинге вверх
    offDown: 0, // смещение номер записи на которую идет позиционирование при движении вниз
    mouseDelta: 30, // минимальнный скролинг при минимальном обороте колесика мыши
};
