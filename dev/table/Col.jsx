import React from 'react';
// import { flex, binds } from 'fmihel-browser-lib'
export default class Col extends React.Component {
    constructor(p) {
        super(p);
    }

    render() {
        const style = { ...this.props.style };

        return (
            <td style={style}>{this.props.children}</td>
        );
    }
}
Col.defaultProps = {
    field: { width: '150px' },
    style: {},
};
