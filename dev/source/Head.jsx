import React from 'react';
import { flex, binds, JX } from 'fmihel-browser-lib';

export default class Head extends React.Component {
    constructor(p) {
        super(p);
    }

    componentDidMount() {
        /*
        if (!this.$table) {
            this.$table = $(`#${this.props.id}`);
            this.$tableFrame = this.$table.closest('#table-frame');
            this.$headerFrame = this.$tableFrame.parent().find('#header-frame');
            this.$header = this.$headerFrame.find('.table');

            this.$tds = this.$header.find('thead td');
            this.componentDidUpdate();
            JX.window.on('resize', () => {
                this.updateHeaderWidth();
            });
        }
        */
    }

    updateHeaderWidth(p = {}) {
        if (!this.props.visible) return;
        // console.info('updateHeaderWidth');
        const Widths = () => {
            const tableWidth = this.$table.width();
            const headerWidth = this.$header.width();
            return {
                table: tableWidth,
                header: headerWidth,
                // eslint-disable-next-line no-nested-ternary
                eq: (parseInt(tableWidth, 10) > parseInt(headerWidth, 10) ? 1 : -1),
            };
        };

        const widths = Widths();
        /*
        if (width.eq > 0) {
            this.$header.width(width.table);
        } else {
            this.$table.width(width.header);
        } */

        // this.$header.width(width.table);
        const Width = (...a) => {
            if (a.length > 1) {
                a[0].width(a[1]);
            }
            return a[0].width();
        };
        const $cols = this.$table.find('tbody tr:first-child').find('td');
        let out = '';
        $.each(this.$tds, (i) => {
            const td = this.$tds.eq(i);
            const col = $cols.eq(i);

            if (Width(td) !== Width(col)) {
                Width(td, Width(col));
            }
            // td.css({ width: `${posCol.w}px` });
            out += ` |${Width(td)}:${Width(col)}| `;
            // if (colW > tdW) {
            // td.width(col.width());
            // JX.pos(td[0], { w: JX.pos(col[0]).w });
            // } else if (tdW > colW) {
            // col.width(td.width());
            //    JX.pos(td[0], { w: JX.pos(col[0]).w });
            // }
        });
        this.$headerFrame.css({ height: this.$header.height() });
        console.info('col', out);
    }

    componentDidUpdate() {
        // this.updateHeaderWidth();
    }

    render() {
        const { light, fields, visible } = this.props;
        const styleTD = {
            overflow: 'hidden',


        };
        return (
            <thead
                className={`thead-${light ? 'light' : 'dark'}`}
                style={{
                    display: (visible ? 'table-header-group' : 'none'),
                    position: 'sticky',
                    width: '100%',
                }}
            >
                <tr>
                    {fields.map((field, i) => <th style={{ ...styleTD }}key={i}>{field.caption || field.name }</th>)}
                </tr>
            </thead>
        );
    }
}
Head.defaultProps = {
    fields: [],
    light: true,
    visible: true,
};
