import React from 'react';
// import { flex, binds } from 'fmihel-browser-lib'
export default class Col extends React.Component {
    constructor(p) {
        super(p);
    }

    render() {
        return (
            <td style={{ ...this.props.style }}>{this.props.children}</td>
        );
    }
}
Col.defaultProps = {
    field: { width: '150px' },
    style: {},
};
