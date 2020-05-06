import React from 'react';
// import { flex, binds } from 'fmihel-browser-lib'
export default class Col extends React.Component {
    constructor(p) {
        super(p);
    }

    render() {
        // console.info('col', this.props.vertical);
        const style = { ...this.props.style };
        if (this.props.vertical) { style.display = 'block'; }
        return (
            <td style={style}>{this.props.children}</td>
        );
    }
}
Col.defaultProps = {
    field: { width: '150px' },
    style: {},
    vertical: false,
};
