import React from 'react';
import { dvc } from 'fmihel-browser-lib';
import Row from './Row.jsx';
import Col from './Col.jsx';

export default class Body extends React.Component {
    constructor(p) {
        super(p);
    }

    render() {
        const style = {
            overflowY: dvc.mobile ? 'auto' : 'hidden',
            display: 'block',
            overflowX: 'hidden',
            // width: '100vw',
            // width: '100%',
            // minWidth: '100&',
        };
        const {
            data, fields,
            keyField,
            css,
            onDrawRow,
            onDrawCol,
            vertical,
        } = this.props;
        let cVertical = Col.defaultProps.vertical;
        if (typeof vertical === 'object') {
            cVertical = { ...Col.defaultProps.vertical, ...vertical };
        } else if (vertical !== true) {
            cVertical = { enable: false };
        }
        return (
            <tbody style={style}>
                {data.map((row, i) => (
                    <Row
                        key={keyField ? row[keyField] : i}
                        fields={fields}
                        data={row}
                        css={css}
                        vertical={cVertical}
                        onDrawCol={onDrawCol}
                        onDrawRow={onDrawRow}
                    />))}

            </tbody>
        );
    }
}

Body.defaultProps = {
    keyField: false,
    fields: [],
    data: [],
    css: {},
    onDrawRow: undefined,
    onDrawCol: undefined,
    vertical: false,
};
