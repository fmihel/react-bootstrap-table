import 'react-virtualized/styles.css';
import { AutoSizer, Column, Table as VirtualTable } from 'react-virtualized';
import React from 'react';
import {
    binds, JX, ut, dvc,
} from 'fmihel-browser-lib';
import _ from 'lodash';
import ScrollSync from './ScrollSync.jsx';
import ScrollBar from './ScrollBar.jsx';

/**
 * Таблица с фиксированным заголовком
 */
export default class Table extends React.Component {
    constructor(p) {
        super(p);
        this.refFrame = React.createRef();
        this.refTable = React.createRef();
        this.tableWidth = 0;
        binds(this, 'rowGetter', 'onScrollFromScrollBar');
    }

    /** виден ли нижний(горизонтальны) scrollbar */
    visibleHorizScrollBar() {
        return (this.refFrame.current) ? (this.refFrame.current.offsetWidth < this.tableWidth) : false;
    }

    visibleVertScrollBar() {
        return (this.refFrame.current) ? (this.refFrame.current.offsetHeight < this.tableHeight) : false;
    }

    rowGetter({ index }) {
        if (index < this.props.data.length) {
            return this.props.data[index];
        }
        const keys = Object.keys(this.props.data[0]);
        const footer = {};
        // eslint-disable-next-line array-callback-return
        keys.map((name) => { footer[name] = ''; });
        return footer;
    }

    componentDidMount() {
        // this.componentDidUpdate();
        console.info(this.refTable.current);
    }

    componentWillUnmount() {
    }

    componentDidUpdate(prevProps) {

    }

    onScrollFromScrollBar({ scrollTop }) {
        this.refTable.current.scrollToPosition(scrollTop);
    }

    renderScrollBar({
        height, scrollHeight, scrollTop, clientHeight,
    }) {
        const { headerHeight, scrollBarSize, theme } = this.props;
        const visible = scrollHeight > ((this.refFrame.current ? this.refFrame.current.offsetHeight : 0) - headerHeight);
        return (
            <ScrollBar
                visible={ visible}
                style={{

                    width: `${scrollBarSize}px`,
                    height: `${height - headerHeight - (this.visibleHorizScrollBar() ? scrollBarSize : 0)}px`,

                    right: '0px',
                    top: `${headerHeight}px`,
                }}
                height={scrollHeight - clientHeight }
                top={scrollTop}
                onScroll={this.onScrollFromScrollBar}
                theme={theme}
            />
        );
    }

    renderTable({ width, height, onScroll }) {
        const {
            showHeader,
            headerHeight,
            data,
            fields,
            footer,
            rowHeight,
            cssRow,
            cssTable,
            cssHeader,
            cssGrid,
        } = this.props;

        const cFooter = _.defaultsDeep(footer, Table.defaultProps.css);
        let w = width;
        const { minWidth } = this.props;
        if (minWidth !== 'fit' && width < minWidth) {
            w = minWidth;
        }
        this.tableWidth = w;

        return (

            <VirtualTable
                ref = {this.refTable}

                className={cssTable}
                rowClassName={cssRow}
                headerClassName={cssHeader}
                gridClassName={cssGrid}

                disableHeader={!showHeader}
                headerHeight={headerHeight}
                height = {height}
                width = {w}
                rowHeight={rowHeight}
                rowGetter={this.rowGetter}
                rowCount={data.length + ((cFooter.enable && data.length > 0) ? 1 : 0)}
                onScroll={onScroll}
            >
                {
                    fields.map((field, i) => <Column
                        key={field.name + String(i)}
                        dataKey = {field.name}
                        label={field.caption ? field.caption : field.name}
                        width={field.width > 0 ? field.width : 0}
                        // eslint-disable-next-line no-nested-ternary
                        flexGrow={field.flexGrow > 0 ? field.flexGrow : (!(field.width > 0) ? 1 : 0)}
                    />)
                }
            </VirtualTable>
        );
    }

    render() {
        // const cCss = _.defaultsDeep(css,Table.defaultProps.css);
        const fitStyle = {
            height: '100%',
            width: '100%',
            boxSizing: 'border-box',
            padding: '0px',
            margin: '0px',
        };
        const { css, theme } = this.props;

        return (
            <ScrollSync>
                { ({ onScroll, ...sync }) => (
                    <div
                        ref = {this.refFrame}
                        style={{ ...fitStyle, overflow: 'hidden' }}
                        className={css + (theme ? `-${theme}` : '')}
                    >
                        <div style={{ ...fitStyle, overflow: 'auto hidden' }}>
                            <AutoSizer>
                                {({ width, height }) => this.renderTable({ width, height, onScroll })}
                            </AutoSizer>
                        </div>

                        <AutoSizer>
                            {({ height }) => this.renderScrollBar({
                                height, ...sync,
                            })}
                        </AutoSizer>

                    </div>
                )}
            </ScrollSync>
        );
    }
}

Table.defaultProps = {
    id: undefined,

    css: 'frame-table',
    theme: '',

    cssTable: 'table',
    cssGrid: 'table-grid',
    cssRow: 'table-row',
    cssHeader: 'table-header',

    keyField: false,
    fields: [
        { name: 'ID', width: 60 },
        {
            name: 'NAME', caption: ' name of client', flexGrow: 2,
        },
        { name: 'AGE', caption: ' ages', width: 100 },
        { name: 'data', caption: ' D(dT)', flexGrow: 1 },
    ],
    data: [
        {
            ID: 1, NAME: 'Mike', AGE: 90, data: '01/02/03',
        },
        {
            ID: 2, NAME: 'Soma', AGE: 7, data: '21/02/20',
        },
        {
            ID: 3, NAME: 'Tomy', AGE: 23, data: '02/02/17',
        },
    ],
    minWidth: 1000, // 'fit'|NUM
    scrollBarSize: 18,
    showHeader: true,
    headerHeight: 64,
    rowHeight: 32,
    footer: {
        enable: true,
        height: 32,
    },
};
