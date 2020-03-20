import React from 'react';
import { binds, ut } from 'fmihel-browser-lib';
import Row from './Row.jsx';


export default class Table extends React.Component {
    constructor(p) {
        super(p);
        binds(this, 'onWheel', 'onScroll');
        this.state = {
            start: this.props.start,
            count: this.props.count,
        };
        this.$owner = false;
        this.$self = false;
        this.scrollCount = 1;
        this.wheelCount = 1;
        this.scrollLock = false;
    }

    onScroll() {
        if (!this.scrollLock) {
            this.scrollLock = true;
            try {
                const st = this.$owner.scrollTop();
                const sc = this.$owner[0].scrollHeight - this.$owner.height();
                this.scrollCount++;
                let type = { scroll: this.scrollCount };
                if (st < 10) {
                    // console.info('top');
                    type = { scroll: 'top' };
                    this.setState((prev) => ({ ...prev, start: prev.start - 2 }));
                } else if (sc - 100 < st) {
                    type = { scroll: 'bottom' };
                    this.setState((prev) => ({ ...prev, start: prev.start + 10 }));
                }
            } catch (e) {
                console.error(e);
            }
            // console.info('scrollTop', st, 'height', sc);
            this.scrollLock = false;
        }
    }

    onWheel(o) {
        this.onScroll();
        this.wheelCount++;
    }

    componentDidUpdate() {
        if (this.$owner === false) {
            this.$self = $(`#${this.props.id}`);
            this.$owner = this.$self.closest('.row');
            this.$owner.scroll(this.onScroll);
            console.info('owner', this.$owner);
        }
    }

    render() {
        const {
            fields, data, keyField, light, onDrawRow, id,
        } = this.props;

        const { start, count } = this.state;

        let outData = [];
        if (count > 0) {
            let from = start;
            if (start + count > data.length - 1) from = data.length - count;
            if (start < 0) from = 0;

            let to = from + count;
            if (to > data.length) to = data.length;


            outData = data.slice(from, to);
        } else {
            outData = data;
        }

        return (
            <table
                id={id}
                className={`table table-sm table-hover table-striped ${light ? '' : ' table-dark'}`}
                onWheel={this.onWheel}
            >
                <thead>
                    <tr>
                        {fields.map((field, i) => <td key={i}>{field.caption || field.name}</td>)}
                    </tr>
                </thead>
                <tbody>
                    {outData.map((d, i) => {
                        let mark = '';
                        if (onDrawRow) {
                            const o = { data: d, all: data, mark: '' };
                            onDrawRow(o);
                            mark = o.mark;
                        }

                        return <Row key={keyField ? d[keyField] : i} fields={fields} data={d} light={light} mark={mark}/>;
                    })}

                </tbody>
            </table>
        );
    }

    render2() {
        const {
            fields, data, keyField, light, onDrawRow,

        } = this.props;


        return (
            <table className={`table table-sm table-hover table-striped ${light ? '' : ' table-dark'}`}>
                <thead>
                    <tr>
                        {fields.map((field, i) => <td key={i}>{field.caption || field.name}</td>)}
                    </tr>
                </thead>
                <tbody>
                    {data.map((d, i) => {
                        let mark = '';
                        if (onDrawRow) {
                            const o = { data: d, all: data, mark: '' };
                            onDrawRow(o);
                            mark = o.mark;
                        }

                        return <Row key={keyField ? d[keyField] : i} fields={fields} data={d} light={light} mark={mark}/>;
                    })}
                </tbody>
            </table>
        );
    }
}
Table.defaultProps = {
    id: ut.random_str(10),
    light: true,
    keyField: false,
    fields: [
        { name: 'ID' },
        { name: 'NAME', caption: ' name of client' },
    ],
    data: [
        { ID: 1, NAME: 'Mike' },
        { ID: 2, NAME: 'Soma' },
        { ID: 3, NAME: 'Tomy' },
    ],
    onDrawRow: undefined,

    count: 100,
    start: 0,
};
