import React from 'react';
import { dvc } from 'fmihel-browser-lib';
import Row from './Row.jsx';

export default class Body extends React.Component {
    constructor(p) {
        super(p);
    }

    render() {
        const style = {
            overflowY: dvc.mobile ? 'auto' : 'hidden',
        };
        const {
            data, fields, keyField, light, onDrawRow, vertical,
        } = this.props;

        return (
            <tbody style={style}>
                {data.map((row, i) => {
                    let mark = '';
                    if (onDrawRow) {
                        const o = {
                            row, data, mark: '', sender: this,
                        };
                        onDrawRow(o);
                        mark = o.mark;
                    }
                    return (
                        <Row
                            key={keyField ? row[keyField] : i}
                            fields={fields}
                            data={row}
                            light={light}
                            mark={mark}
                            vertical={vertical}
                        />);
                })}

            </tbody>
        );
    }
}
Body.defaultProps = {
    fields: [],
    keyField: false,
    data: [],
    light: true,
    onDrawRow: undefined,
};
