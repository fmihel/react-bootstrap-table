import React from 'react';
// import { flex, binds } from 'fmihel-browser-lib'
export default class Col extends React.Component {
    constructor(p) {
        super(p);
    }

    render() {
        const custom = {
            sender: this,
            caption: this.props.field.caption ? this.props.field.caption : this.props.field.name,
            value: this.props.children,
            css: '',
            style: {},
        };
        if (this.props.onDrawCol) {
            this.props.onDrawCol(custom);
        }

        if (this.props.vertical.enable) {
            custom.style.display = 'block';
            if (this.props.vertical.showCaption) {
                const styleCaption = this.props.vertical.direct === 'row' ? { minWidth: this.props.vertical.widthCaption } : {};
                custom.value = (
                    <div style={{
                        display: 'flex',
                        flexDirection: this.props.vertical.direct,
                        flexWrap: 'nowrap',
                        justifyContent: 'flex-start',
                        alignContent: 'stretch',
                        alignItems: 'stretch',
                    }}>
                        <div style={styleCaption}>{custom.caption}</div>
                        <div style={{
                            order: 0,
                            flex: '1 1 auto',
                            alignSelf: 'auto',
                        }}>{custom.value}</div>
                    </div>
                );
            }
        }
        return (
            <td style={custom.style}>{custom.value}</td>
        );
    }
}
Col.defaultProps = {
    field: { },
    onDrawCol: undefined,
    vertical: {
        enable: true,
        showCaption: true,
        direct: 'row',
        widthCaption: '120px',
    },
};
