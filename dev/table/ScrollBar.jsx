import React from 'react';
import {
    ut, JX, binds, flex,
} from 'fmihel-browser-lib';
import './ScrollBar.scss';


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
            posCoord: { x: 0, y: 0 },
            pos: 0,

        };
        this.mouse = {
            state: '',
            timer: false,
            direct: '',
            pos: { x: 0, y: 0 },
        };
        this.lockInnerScroll = false;
    }

    setPos(pos) {
        if (!this.lockInnerScroll) {
            this.setState({
                pos,
                posCoord: { y: this.rowNumToCoord(pos), x: 0 },
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
        }
    }

    onMouseDownUp() {
        this.initMousePressed({ direct: 'up', btn: 'arrow' });
    }

    onMouseDownDown() {
        this.initMousePressed({ direct: 'down', btn: 'arrow' });
    }

    onMouseDownPos() {
        this.initMousePressed({ btn: 'pos' });
    }

    /**
     * расчитывает абсолютный номер строки
     * @param {int} pos текущая координата ползунка
     * @param {int} posH высота ползунка
     * @param {int} frameH высота фрейма ползунка
     */
    coordToRowNum(pos, posH, frameH) {
        if (pos === 0) { return 0; }
        const res = Math.round(ut.translate(pos, 0, frameH - posH, 0, this.props.data.length - 1));

        return res;
    }

    /**
     * возвращает координату ползунка, соотвествующую номеру строки
    */
    rowNumToCoord(num) {
        const size = JX.pos(this.$pos[0]);
        const sizeFrame = JX.pos(this.$posFrame[0]);

        const res = ut.translate(num, 0, this.props.data.length - 1, 0, sizeFrame.h - size.h);

        return res;
    }

    onMouseMovePos() {
        this.lockInnerScroll = true;
        this.setState((prev) => {
            const current = JX.mouse();
            const size = JX.pos(this.$pos[0]);
            const sizeFrame = JX.pos(this.$posFrame[0]);
            const state = { posCoord: { y: prev.posCoord.y + current.y - this.mouse.pos.y } };
            if (state.posCoord.y < 0) {
                state.posCoord.y = 0;
            }
            if (state.posCoord.y + size.h > sizeFrame.h) {
                state.posCoord.y = sizeFrame.h - size.h;
            }
            this.mouse.pos = current;

            const rowNum = this.coordToRowNum(state.posCoord.y, size.h, sizeFrame.h);
            if (this.timerPos) {
                clearTimeout(this.timerPos);
            }
            this.timerPos = setTimeout(() => {
                this.timerPos = undefined;
                if (this.props.onScroll) {
                    this.props.onScroll({ moveTo: rowNum });
                }
                this.lockInnerScroll = false;
            }, 10);
            return state;
        });
    }

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
    }

    componentDidMount() {
        if (this.$self === undefined) {
            this.$self = $(`#${this.props.id}`);
            this.$owner = this.$self.parent();
            this.$table = this.$owner.find(`#${this.props.idTable}`);
            this.$head = this.$table.find('thead');
            this.$body = this.$table.find('tbody');
            this.$pos = this.$self.find(`#${this.props.idBtnPos}`);
            this.$posFrame = this.$pos.parent();
            this.resizeObserver = new ResizeObserver((o) => {
                this.align();
            });
            this.resizeObserver.observe(this.$owner[0]);
            if (this.props.onInit) {
                this.props.onInit({ sender: this });
            }
        }
        this.componentDidUpdate();
    }

    componentDidUpdate() {
        this.align();
    }

    componentWillUnmount() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }

    render() {
        const { id, idBtnPos } = this.props;
        const { posCoord } = this.state;
        return (
            <div
                id={id}
                style={{
                    position: 'absolute',
                    ...flex('vert'),
                }}
                className='table-scroll-bar'
                onMouseLeave={this.doneMousePressed}
            >
                <div className="table-scroll-bar-up"
                    style={{ ...flex('fixed') }}
                    onMouseDown={this.onMouseDownUp}
                >
                    up
                </div>
                <div className="table-scroll-bar-pos-frame" style={{ ...flex('stretch') }} >
                    <div
                        className="table-scroll-bar-pos"
                        id={idBtnPos}
                        onMouseDown={this.onMouseDownPos}
                        style={{ position: 'relative', top: `${posCoord.y}px` }}
                    />
                </div>
                <div
                    className="table-scroll-bar-down"
                    style={{ ...flex('fixed') }}
                    onMouseDown={this.onMouseDownDown}
                >
                    down
                </div>
            </div>
        );
    }
}
ScrollBar.defaultProps = {
    idTable: undefined, // идентификатор таблицы, для которой работает scrollBar
    idBtnPos: ut.random_str(7), // идентификатор кнопки ползунка
    id: ut.random_str(7), // идентификатор ScrollBar
    onInit: undefined, // событие возникающее один раз после первого создания компонента (передаем наверх ссылку на себя)
    onPress: undefined, // событие нажтия кнопок вверх/вниз
    onScroll: undefined, // событие при смещения ползунка
    delta: 30, // на сколько смещается таблица при нажатии кнопок вверх/вниз
    interval: 50, // интервал отправки события зажатия кнопок вверх/вниз
    data: [], // массив данных, используется в основном для определения кол-ва строк
    midRowHeight: 32, // среднее значение высоты строки
};
