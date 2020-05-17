import React from 'react';
import Col from './Col.jsx';
// import { flex, binds } from 'fmihel-browser-lib'
export default class Row extends React.Component {
    constructor(p) {
        super(p);
    }

    render() {
        const {
            fields, data, light, vertical, onDrawCol, onDrawRow,
        } = this.props;
        const css = {
            select: { light: 'table-primary', dark: 'bg-primary' },
            error: { light: 'table-danger', dark: 'bg-danger' },
        };
        const theme = light ? 'light' : 'dark';
        const custom = {
            sender: this,
            mark: '',
        };
        if (onDrawRow) {
            onDrawRow(custom);
        }
        return (
            <tr
                className={(custom.mark in css ? css[custom.mark][theme] : '')}
                style={vertical.enable ? { display: 'block' } : {}}>
                {fields.map((field, i) => <Col
                    key={field.name + i}
                    field={field}
                    vertical={vertical}
                    data={data}
                    onDrawCol={onDrawCol}
                    light={light}
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
    light: true,
    vertical: undefined,
    onDrawCol: undefined,
    onDrawRow: undefined,
};
