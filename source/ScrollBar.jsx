import React from 'react';
import {
    binds, ut, JX,
} from 'fmihel-browser-lib';

export default class ScrollBar extends React.Component {
    constructor(...p) {
        super(...p);
        this.state = {
            top: this.props.top,
        };
        this.refField = React.createRef();
        this.refPos = React.createRef();
        this.scroll = {
            down: false,
            y: 0,
        };
        binds(this, 'onCursorKeyDown', 'onCursorKeyUp', 'onMouseMove', 'onClickUp', 'onClickDown');
    }

    /** максимальная длина пути перемещения ползунка */
    getMaxHeightPosLen() {
        return this.refField.current.offsetHeight - this.refPos.current.offsetHeight;
    }

    /** пересчет относительных единиц положения ползунка в реальные */
    getTop(top) {
        if (this.props.height > 0) {
            const max = this.getMaxHeightPosLen();
            const out = ut.translate(top, 0, this.props.height, 0, max);
            if (out < 0) return 0;
            if (out > max) return max;
            return out;
        }
        return 0;
    }

    propsTopToState() {
        // если не зажата кнопка мыши
        if (!this.scroll.down) {
            const top = this.getTop(this.props.top);
            if (this.state.top !== top) this.setState({ top });
        }
    }

    onCursorKeyUp() {
        this.scroll.down = false;
        JX.window.off('mouseup', this.onCursorKeyUp);
        JX.window.off('mousemove', this.onMouseMove);
    }

    onCursorKeyDown() {
        this.scroll.down = true;
        this.scroll.y = JX.mouse().y;
        JX.window.on('mouseup', this.onCursorKeyUp);
        JX.window.on('mousemove', this.onMouseMove);
    }

    onMouseMove() {
        const mouse = JX.mouse();
        const dy = mouse.y - this.scroll.y;
        this.scroll.y = mouse.y;

        this.setState((prev) => {
            const top = prev.top + dy;
            const max = this.getMaxHeightPosLen();
            if (this.props.onScroll) {
                this.props.onScroll({ scrollTop: ut.translate(top, 0, max, 0, this.props.height) });
            }
            if (top < 0) {
                return { top: 0 };
            }
            if (top > max) {
                return { top: max };
            }

            return { top };
        });
    }

    onClickUp() {
        this.hTimerPress = setInterval(() => {
            if (this.props.onPressUp) this.props.onPressUp();
        }, this.props.pressTimerDelay);

        JX.window.on('mouseup', () => {
            clearInterval(this.hTimerPress);
            this.hTimerPress = undefined;
        });

        // if (this.props.onPressUp) this.props.onPressUp();
    }

    onClickDown() {
        this.hTimerPress = setInterval(() => {
            if (this.props.onPressDown) this.props.onPressDown();
        }, this.props.pressTimerDelay);

        JX.window.on('mouseup', () => {
            clearInterval(this.hTimerPress);
            this.hTimerPress = undefined;
        });
    }

    componentDidMount() {
        this.propsTopToState();
    }

    componentDidUpdate() {
        this.propsTopToState();
    }

    render() {
        const {
            style, css, visible,
        } = this.props;
        const { top } = this.state;
        return (
            <div
                style={{
                    ...style,
                    position: 'absolute',
                    display: visible ? 'flex' : 'none',
                    flexDirection: 'column',
                    flexWrap: 'wrap',
                    justifyContent: 'flex-start',
                    alignContent: 'stretch',
                    alignItems: 'stretch',
                }}
                className={`${css}`}
            >
                <div
                    className="table-scroll-bar-up"
                    style={{
                        order: 0,
                        flex: '0 1 auto',
                        alignSelf: 'auto',
                    }}
                    onMouseDown={this.onClickUp}

                ></div>
                <div
                    ref = {this.refField}
                    className="table-scroll-bar-pos-frame"
                    style={{
                        order: 0,
                        flex: '1 1 auto',
                        alignSelf: 'auto',
                    }}
                >
                    <div
                        ref = {this.refPos}
                        className="table-scroll-bar-pos"
                        style={{
                            position: 'relative',
                            top,
                            height: '20px',
                            width: '100%',
                            left: '0px',
                        }}
                        onMouseDown={this.onCursorKeyDown}
                    />
                </div>
                <div
                    className="table-scroll-bar-down"
                    style={{
                        order: 0,
                        flex: '0 1 auto',
                        alignSelf: 'auto',
                    }}
                    onMouseDown={this.onClickDown}
                ></div>
            </div>
        );
    }
}
ScrollBar.defaultProps = {
    css: 'table-scroll-bar',
    style: {},

    height: 100,
    top: 100,

    onScroll: undefined,
    onPressUp: undefined,
    onPressDown: undefined,

    visible: true,
    pressTimerDelay: 10,
};
