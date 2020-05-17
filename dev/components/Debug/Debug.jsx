import React from 'react';
import { binds, JX } from 'fmihel-browser-lib';
import { connect } from 'react-redux';
import './data';
import './actions/debug';
import './Debug.scss';
import DebugItem from './DebugItem.jsx';

class Debug extends React.Component {
    constructor(p) {
        super(p);
        this.state = {
            x: 0, y: 0,
        };
        this.move = false;
        this.mouse = {};
        this.$debug = undefined;
        this.screen = undefined;
        binds(this, 'onMouseDown', 'onMouseUp', 'onMouseMove', 'onMouseLeave');
        JX.window.on('resize', () => { this.onScreenResize(); });

        JX.window.on('mousemove', this.onMouseMove);
        JX.window.on('mouseup', this.onMouseUp);
    }

    onMouseDown() {
        this.move = true;
        this.mouse = JX.mouse();
    }

    onMouseUp() {
        this.onMouseLeave();
    }

    toScreen(coord, area) {
        const screen = JX.screen();
        const out = { ...coord };
        if (screen.w < coord.x + area.w) out.x = screen.w - area.w;
        if (screen.h < coord.y + area.h) out.y = screen.h - area.h;
        if (screen.x > coord.x) out.x = screen.x;
        if (screen.y > coord.y) out.y = screen.y;
        return out;
    }

    onMouseMove() {
        if (this.move) {
            this.setState((prev) => {
                const current = JX.mouse();
                const area = JX.pos(this.$debug[0]);
                const coord = this.toScreen({
                    x: prev.x + current.x - this.mouse.x,
                    y: prev.y + current.y - this.mouse.y,
                }, area);

                this.mouse = current;
                return { ...prev, ...coord };
            });
        }
    }

    onMouseLeave() {
        this.move = false;
    }

    onScreenResize() {
        const screen = JX.screen();
        const pos = { x: parseInt(this.$debug.css('left'), 10), y: parseInt(this.$debug.css('top'), 10) };
        const newPos = {};

        if (pos.x > this.screen.w / 2) {
            newPos.x = pos.x + screen.w - this.screen.w;
        }
        if (pos.y > this.screen.h / 2) {
            newPos.y = pos.y + screen.h - this.screen.h;
        }


        this.setState(newPos);
        this.screen = screen;
    }

    componentDidMount() {
        this.screen = JX.screen();
        this.$debug = $('#debug');
        const pos = JX.pos(this.$debug[0]);


        this.setState({
            x: this.screen.w - pos.w - 20,
            y: this.screen.h - pos.h - 20,
        });
    }

    componentDidUpdate() {
        const coord = { ...this.state };
        const area = JX.pos(this.$debug[0]);
        const inCoord = this.toScreen(coord, area);
        if ((coord.x !== inCoord.x) || (coord.y !== inCoord.y)) {
            this.setState(inCoord);
        }
    }

    render() {
        const { debug } = this.props;
        const names = Object.keys(debug.list);
        return (

            <div id="debug"
                onMouseDown={this.onMouseDown}
                style={{
                    position: 'absolute',
                    border: '1px solid #343A40',
                    left: `${this.state.x}px`,
                    top: `${this.state.y}px`,
                    fontSize: '0.8em',
                    padding: '5px',
                    userSelect: 'none',
                    background: 'black',
                    borderRadius: '3px',
                    minWidth: '100px',
                    minHeight: '24px',

                }}
            >
                <div
                    style={{
                        background: 'black',
                        position: 'absolute',
                        top: '-8px',
                        left: '3px',
                        fontSize: '0.7em',
                        color: '#343A40',
                        borderTop: '1px solid #343A40',
                        borderLeft: '1px solid #343A40',
                        borderRight: '1px solid #343A40',
                        borderRadius: '3px',
                        height: '10px',
                        lineHeight: '9px',
                        paddingLeft: '3px',
                        paddingRight: '3px',
                    }}
                >
                    debug
                </div>
                {
                    names.map((name) => <DebugItem key={name} name={name} value={debug.list[name]} />)
                }

            </div>
        );
    }
}
Debug.defaultProps = {
// default
};


const mapStateToProps = (state) => ({
    debug: state.debug,
});

export default connect(mapStateToProps)(Debug);
