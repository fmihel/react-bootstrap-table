import React from 'react';
import {
    ut, JX, binds, flex,
} from 'fmihel-browser-lib';


export default class ScrollBar extends React.Component {
    constructor(p) {
        super(p);
        binds(this, 'onMouseDownUp',
            'onMouseDownDown',
            'doTimer',
            'doneMousePressed',
            'onMouseDownPos',
            'onMouseMovePos');
        this.state = {
            posCoord: 0,
            posHeight: 32,
            id: this.props.id ? this.props.id : ut.random_str(7),
            idBtnPos: this.props.idBtnPos ? this.props.idBtnPos : ut.random_str(7),
        };
        this.mouse = {
            state: '',
            timer: false,
            direct: '',
            pos: { x: 0, y: 0 },
        };
        this.numRow = 0;
        this.lockInnerScroll = false;
    }

    /**
    * метод вызывается из родительского react компонета, см Table.onScroll
    * вызывает перерисовку позиции ползунка,
    * если ползунок перемещаем вручную, то данны метод блокируется
    * см onMouseDownPos
    * !! Так не рекомендуется делать, по идеологии react, но пока не нашел другого способа :(
    */
    setPos(numRow) {
        if (!this.lockInnerScroll) {
            this.numRow = numRow;
            this.setState({
                // pos,
                posCoord: this.rowNumToCoord(numRow),
            });
        }
    }

    doTimer() {
        try {
            if (this.props.onPress) {
                this.props.onPress({
                    sender: this,
                    direct: this.mouse.direct,
                    delta: (this.mouse.direct === 'up' ? -1 : 1) * this.props.delta,
                });
            }
        } catch (e) {
            //
        }
    }

    initMousePressed(param) {
        const p = {
            btn: 'arrow',
            ...param,
        };
        this.mouse = {
            state: 'down',
            direct: p.direct,
            timer: p.btn === 'arrow' ? setInterval(this.doTimer, this.props.interval) : false,
            pos: JX.mouse(),
            btn: p.btn,
        };

        JX.window.on('mouseup', this.doneMousePressed);

        if (p.btn === 'pos') {
            JX.window.on('mousemove', this.onMouseMovePos);
        }
    }

    /** обработчик отжатия кнопки мыши
     */
    doneMousePressed() {
        if (this.mouse.state === 'down') {
            JX.window.off('mouseup', this.doneMousePressed);

            if (this.mouse.btn === 'pos') {
                JX.window.off('mousemove', this.onMouseMovePos);
            }
            if (this.mouse.timer) {
                clearInterval(this.mouse.timer);
            }
            this.mouse = {
                state: 'up',
                direct: '',
                timer: false,

            };
            this.lockInnerScroll = false;
        }
    }

    onMouseDownUp() {
        this.initMousePressed({ direct: 'up', btn: 'arrow' });
    }

    onMouseDownDown() {
        this.initMousePressed({ direct: 'down', btn: 'arrow' });
    }

    /** обработчик зажатия ползунка
     */
    onMouseDownPos() {
        // блокруем вызов перерисовуи из Table,
        // разблокировка в doneMousePressed
        this.lockInnerScroll = true;
        this.initMousePressed({ btn: 'pos' });
    }

    /** обработка перетаскивания ползунка
    */
    onMouseMovePos() {
        this.setState((prev) => {
            const current = JX.mouse();
            const size = JX.pos(this.$pos[0]);
            const sizeFrame = JX.pos(this.$posFrame[0]);
            const state = { posCoord: prev.posCoord + current.y - this.mouse.pos.y };
            if (state.posCoord < 0) {
                state.posCoord = 0;
            }
            let bottom = false;
            if (state.posCoord + size.h > sizeFrame.h) {
                state.posCoord = sizeFrame.h - size.h;
                bottom = true;
            }
            this.mouse.pos = current;

            this.numRow = bottom ? this.props.data.length - 1 : this.coordToRowNum(state.posCoord, sizeFrame.h);


            if (this.timerPos) {
                clearTimeout(this.timerPos);
            }
            this.timerPos = setTimeout(() => {
                this.timerPos = undefined;
                if (this.props.onScroll) {
                // отключил обновление state.pos, т.к. это не влияет н
                // this.setState({ pos: rowNum });
                    this.props.onScroll({ moveTo: this.numRow });
                }
            // this.lockInnerScroll = false;
            }, 20);
            return state;
        });
    }

    /** расчитывает абсолютный номер строки
     * @param {int} pos текущая координата ползунка
     * @param {int} frameH высота фрейма ползунка
     */
    coordToRowNum(pos, frameH) {
        if (pos === 0) { return 0; }
        const res = Math.round(ut.translate(pos, 0, frameH, 0, this.props.data.length - 1));
        return res;
    }

    /** возвращает координату ползунка, соотвествующую номеру строки
    */
    rowNumToCoord(num) {
        const size = JX.pos(this.$pos[0]);
        const sizeFrame = JX.pos(this.$posFrame[0]);
        // console.info(size, sizeFrame);

        let res = this.props.data.length > 1 ? ut.translate(num, 0, this.props.data.length - 1, 0, sizeFrame.h) : 0;
        if (res + size.h > sizeFrame.h) {
            res = sizeFrame.h - size.h;
        }
        return res;
    }

    /**
     * позиционирование scrollbar
    */
    align() {
        const own = JX.pos(this.$owner[0]);
        const scroll = JX.pos(this.$self[0]);
        const head = JX.pos(this.$head[0]);
        const pos = {
            x: own.w - scroll.w,
            y: head.h,
            w: scroll.w,
            h: own.h - head.h,
        };
        this.$self.css({
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            width: `${pos.w}px`,
            height: `${pos.h}px`,
        });
        this.updatePosHeight();
    }

    /** пересчет координат и размера ползунка, которые происходят когда область отображения
     * изменяется по высоте
    */
    updatePosHeight() {
        const pos = JX.pos(this.$pos[0]);
        // const posFrame = JX.pos(this.$posFrame[0]).h;
        const posFrame = JX.pos(this.$self[0]).h - (JX.pos(this.$up[0]).h + JX.pos(this.$down[0]).h);

        const view = JX.pos(this.$owner[0]).h - JX.pos(this.$head[0]).h;
        let posHeight = Math.round((posFrame * view) / (this.props.midRowHeight * this.props.data.length));
        if (posHeight < 10) {
            posHeight = 10;
        }
        if (posHeight > posFrame) {
            posHeight = posFrame - 2;
        }
        const posCoord = this.rowNumToCoord(this.numRow);
        if ((pos.h !== posHeight) || (pos.y !== posCoord)) {
            this.setState({
                posHeight,
                posCoord,
            });
        }
    }

    componentDidMount() {
        if (this.$self === undefined) {
            this.$self = $(`#${this.state.id}`);
            this.$owner = this.$self.parent();
            this.$table = this.$owner.find(`#${this.props.idTable}`);
            this.$head = this.$table.find('thead');
            this.$body = this.$table.find('tbody');
            this.$pos = this.$self.find(`#${this.state.idBtnPos}`);
            this.$posFrame = this.$pos.parent();
            this.$up = this.$self.find('.table-scroll-bar-up');
            this.$down = this.$self.find('.table-scroll-bar-down');

            this.resizeObserver = new ResizeObserver(() => {
                this.align();
            });
            this.resizeObserver.observe(this.$owner[0]);
            if (this.props.onInit) {
                this.props.onInit({ sender: this });
            }
        }
        this.componentDidUpdate();
    }

    componentDidUpdate(prev) {
        // вызываем периррисовку если изменились данные
        if ((prev !== undefined) && (
            (ut.get(prev, 'data', 'length', 0) !== ut.get(this.props, 'data', 'length', 0))
            || (ut.get(prev, 'midRowHeight', 0) !== ut.get(this.props, 'midRowHeight', 0))
            || (ut.get(prev, 'showHeader', true) !== ut.get(this.props, 'showHeader', true))
        )) {
            this.align();
        }
    }

    componentWillUnmount() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }

    render() {
        const { visible, theme, hideOnNotActive } = this.props;
        const {
            idBtnPos, id, posCoord, posHeight,
        } = this.state;
        const style = {
            position: 'absolute',
            ...flex('vert'),
        };
        if (!visible) { style.opacity = 0; }

        return (
            <div
                id={id}
                style={style}
                className={`table-scroll-bar${theme ? '-'+theme  : ''} ${hideOnNotActive ? 'table-scroll-bar-animate' : ''}`}
                onMouseLeave={this.doneMousePressed}
            >
                <div className="table-scroll-bar-up"
                    style={{ ...flex('fixed') }}
                    onMouseDown={this.onMouseDownUp}
                >

                </div>
                <div className="table-scroll-bar-pos-frame" style={{ ...flex('stretch') }} >
                    <div
                        className="table-scroll-bar-pos"
                        id={idBtnPos}
                        onMouseDown={this.onMouseDownPos}
                        style={{
                            position: 'relative',
                            top: `${posCoord}px`,
                            height: `${posHeight}px`,
                        }}
                    >

                    </div>
                </div>
                <div
                    className="table-scroll-bar-down"
                    style={{ ...flex('fixed') }}
                    onMouseDown={this.onMouseDownDown}
                >

                </div>
            </div>
        );
    }
}
ScrollBar.defaultProps = {
    
    css:'table-scroll-bar',
    theme:'',//схема отображения
    idTable: undefined, // идентификатор таблицы, для которой работает scrollBar
    idBtnPos: undefined, // идентификатор кнопки ползунка
    id: undefined, // идентификатор ScrollBar
    onInit: undefined, // событие возникающее один раз после первого создания компонента (передаем наверх ссылку на себя)
    onPress: undefined, // событие нажтия кнопок вверх/вниз
    onScroll: undefined, // событие при смещения ползунка
    delta: 30, // на сколько смещается таблица при нажатии кнопок вверх/вниз
    interval: 50, // интервал отправки события зажатия кнопок вверх/вниз
    data: [], // массив данных, используется в основном для определения кол-ва строк
    midRowHeight: 32, // среднее значение высоты строкиn(используется для рачета высоты ползунка)
    hideOnNotActive: false, // скрывать, когда мышь не на нем
    visible: true,
    showHeader: true,

};
