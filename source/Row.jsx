import React from 'react';
import Col from './Col.jsx';
// import { flex, binds } from 'fmihel-browser-lib'
export default class Row extends React.Component {
    constructor(p) {
        super(p);
    }

    render() {
        const {
            fields, data, css, vertical, onDrawCol, onDrawRow,
        } = this.props;

        const theme = css.theme ? css.theme : 'light';
        const custom = {
            sender: this,
            mark: '',
        };
        if (onDrawRow) {
            onDrawRow(custom);
        }
        return (
            <tr
                className={(custom.mark in css.row ? css.row[custom.mark][theme] : '')}
                style={vertical.enable ? { display: 'block' } : {}}>
                {fields.map((field, i) => <Col
                    key={field.name + i}
                    field={field}
                    vertical={vertical}
                    data={data}
                    onDrawCol={onDrawCol}
                    css={css}
                >
                    {data[field.name]}
                </Col>)
                }
            </tr>
        );
    }
}
Row.defaultProps = {
    fields: [{ name: 'ID' }, { name: 'NAME' }],
    data: { NAME: 'Mike', ID: 1 },
    css: {},
    vertical: undefined,
    onDrawCol: undefined,
    onDrawRow: undefined,
};
