import React from 'react';
import { flex, binds } from 'fmihel-browser-lib';

export default class DebugItem extends React.Component {
    constructor(p) {
        super(p);
        this.myRef = React.createRef();
        binds(this, 'onClick');
    }

    onClick() {
        const node = this.myRef.current;
        $(node).toggleClass('debug-item-active');
    }

    render() {
        return (
            <div
                ref={this.myRef}
                onDoubleClick={this.onClick}
                className="debug-item"
                style={{
                    ...flex('horiz'),
                }}
            >
                <div style={{ ...flex('fixed'), width: '100px' }}>{this.props.name}</div>
                <div style={{ ...flex('stretch') }}>{this.props.value}</div>
            </div>
        );
    }
}
DebugItem.defaultProps = {
    name: '',
    value: '',
};
