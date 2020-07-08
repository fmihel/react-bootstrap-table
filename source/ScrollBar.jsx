import React from 'react';
import {
    binds, ut, JX,
} from 'fmihel-browser-lib';

export default class ScrollBar extends React.Component {
    constructor(p) {
        super(p);
        this.state = {
            top: this.props.top,
        };
        this.refField = React.createRef();
        this.scroll = {
            down: false,
            y: 0,
        };
        binds(this, 'onCursorKeyDown', 'onCursorKeyUp', 'onMouseMove');
    }

    reCulcTop() {
        // console.info(this.refField.current.offsetHeight, this.props.height);
        if (!this.scroll.down) {
            if (this.props.height > 0) {
                const top = ut.translate(this.props.top, 0, this.props.height, 0, this.refField.current.offsetHeight);
                if (this.state.top !== top) this.setState({ top });
            }
        }
    }

    onCursorKeyUp() {
        console.info('up');
        this.scroll.down = false;
        JX.window.off('mouseup', this.onCursorKeyUp);
        JX.window.off('mousemove', this.onMouseMove);
    }

    onCursorKeyDown() {
        console.info('down');
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
            if (this.props.onScroll) this.props.onScroll({ scrollTop: ut.translate(top, 0, this.refField.current.offsetHeight, 0, this.props.height) });
            return { top: top < 0 ? 0 : top };
        });
    }

    componentDidMount() {
        this.reCulcTop();
    }

    componentDidUpdate() {
        this.reCulcTop();
    }

    render() {
        const {
            style, css,
        } = this.props;
        const { top } = this.state;
        return (
            <div
                style={{
                    ...style,
                    display: 'flex',
                    flexDirection: 'column',
                    flexWrap: 'wrap',
                    justifyContent: 'flex-start',
                    alignContent: 'stretch',
                    alignItems: 'stretch',
                    border: '1px solid green',
                }}
                className={css}
            >
                <div
                    style={{
                        order: 0,
                        flex: '0 1 auto',
                        alignSelf: 'auto',
                    }}
                >up</div>
                <div
                    ref = {this.refField}
                    style={{
                        order: 0,
                        flex: '1 1 auto',
                        alignSelf: 'auto',
                    }}
                >
                    <div
                        onMouseDown={this.onCursorKeyDown}
                        style={{
                            position: 'relative',
                            top,
                            height: '20px',
                            border: '1px solid red',
                            width: '100%',
                            left: '0px',
                        }}
                    />
                </div>
                <div
                    style={{
                        order: 0,
                        flex: '0 1 auto',
                        alignSelf: 'auto',
                    }}

                >dn</div>
            </div>
        );
    }
}
ScrollBar.defaultProps = {
    height: 100,
    top: 100,
    style: {},
    css: 'scroll-bar',
    onScroll: undefined,
};
