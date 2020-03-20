import React from 'react';
import Col from './Col.jsx';
// import { flex, binds } from 'fmihel-browser-lib'
export default class Row extends React.Component {
    constructor(p) {
        super(p);
    }

    render() {
        const {
            fields, data, light, mark,
        } = this.props;
        const css = {
            select: { light: 'table-primary', dark: 'bg-primary' },
            error: { light: 'table-danger', dark: 'bg-danger' },
        };
        const theme = light ? 'light' : 'dark';
        return (
            <tr className={(mark in css ? css[mark][theme] : '')}>
                {fields.map((field, i) => <Col key={field.name + i}>{data[field.name]}</Col>)}
            </tr>
        );
    }
}
Row.defaultProps = {
    fields: [{ name: 'ID' }, { name: 'NAME' }],
    data: { NAME: 'Mike', ID: 1 },
    light: true,
    mark: '',
};
