import 'react-virtualized/styles.css';
import { AutoSizer, Column, Table as VirtualTable } from 'react-virtualized';
import React from 'react';
import {
    binds, JX, ut, dvc,
} from 'fmihel-browser-lib';
import _ from 'lodash';
import ScrollSync from './ScrollSync.jsx';
import ScrollBar from './ScrollBar.jsx';
import Heights from './Heights';

/**
 * Таблица с фиксированным заголовком
 */
export default class Table extends React.Component {
    constructor(...p) {
        super(...p);
        this.refFrame = React.createRef();
        this.refTable = React.createRef();
        this.tableWidth = 0;
        this.heights = [];
        this.heightWorker = new Heights();
        this.currentScrollTop = 0;
        this.state = {
            id: this.props.id ? this.props.id : ut.random_str(7),
            keyUpdate: ut.random_str(10),
        };
        binds(this, 'rowGetter', 'onScrollFromScrollBar', 'rowHeight', 'onResize', 'onPressUp', 'onPressDown', 'doScrollTable');
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

    _updateHeights() {
        /*
        const {
            fields, cssHeader, data, footer, rowHeight,
        } = this.props;

        const { id } = this.state;
        const $headers = JX.$(`.${cssHeader}`, { group: id, $parent: JX.$(`#${id}`, { group: id }) });
        const widths = fields.map((field, i) => JX.pos($headers[i]).w);

        this.heights = data.map((dat, index) => {
            let h = (typeof rowHeight === 'function' ? rowHeight({ index }) : rowHeight);
            fields.map((field, i) => {
                if ((field.height === 'stretch') && (!footer.enable || index < data.length)) {
                    const item = data[index];
                    const size = JX.textSize(item[field.name], { width: widths[i], refresh: false, parentDom: JX.$(`#${id}`)[0] }); // габариты текста при вписывании в ширину w
                    h = Math.max(size.h, h);
                }
            });
            return h;
        });
        if (footer.enable) {
            this.heights.push(footer.height);
        }
        */
        const hw = this.heightWorker;
        hw.props = this.props;
        hw.state = this.state;
        hw.update();
    }

    rowHeight(o) {
        /*
        if (this.heights.length === 0) {
            this._updateHeights();
        }

        return this.heights[o.index];
        */
        if (this.heightWorker.needUpdate()) this._updateHeights();

        return this.heightWorker.get(o.index);
    }

    onPressUp() {
        this.refTable.current.scrollToPosition(this.currentScrollTop - 10);
    }

    onPressDown() {
        this.refTable.current.scrollToPosition(this.currentScrollTop + 10);
    }

    onResize(forced = false) {
        const update = (repeat) => {
            this.resizeTimer = undefined;
            if (repeat) {
                // this.heights = [];
                this.heightWorker.clear();
            }
            this.repeat = repeat;
            this.setState({ keyUpdate: ut.random_str(10) });
        };

        if (this.resizeTimer) clearTimeout(this.resizeTimer);
        if (forced) {
            update(false);
        } else {
            this.resizeTimer = setTimeout(() => {
                update(true);
            }, 100);
        }
    }

    componentDidMount() {
        this.resizeObserver = new ResizeObserver(() => {
            this.onResize();
        });
        this.resizeObserver.observe(this.refFrame.current);
        this.onResize();
    }

    componentWillUnmount() {
        if (this.resizeTimer) clearTimeout(this.resizeTimer);
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }

    componentDidUpdate() {
        if (this.repeat) this.onResize(true);
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
                onPressUp={this.onPressUp}
                onPressDown={this.onPressDown}
            />
        );
    }

    doScrollTable(...p) {
        if (this.onScrollTable) {
            this.currentScrollTop = p[0].scrollTop;
            // console.log('scroll', p);
            this.onScrollTable(...p);
        }
    }

    renderTable({ width, height, onScroll }) {
        const {
            showHeader,
            headerHeight,
            data,
            fields,
            footer,
            cssRow,
            cssTable,
            cssHeader,
            cssGrid,
        } = this.props;
        const { id, keyUpdate } = this.state;

        const cFooter = _.defaultsDeep(footer, Table.defaultProps.css);
        let w = width;
        const { minWidth } = this.props;
        if (minWidth !== 'fit' && width < minWidth) {
            w = minWidth;
        }
        this.tableWidth = w;
        this.onScrollTable = onScroll;
        return (

            <VirtualTable

                ref = {this.refTable}
                key = {keyUpdate}
                id={id}
                className={cssTable}
                rowClassName={cssRow}
                headerClassName={cssHeader}
                gridClassName={cssGrid}

                disableHeader={!showHeader}
                headerHeight={headerHeight}
                height = {height}
                width = {w}
                rowHeight={this.rowHeight}
                rowGetter={this.rowGetter}
                rowCount={data.length + ((cFooter.enable && data.length > 0) ? 1 : 0)}
                onScroll={this.doScrollTable}
            >
                {
                    fields.map((field, i) => <Column
                        key={field.name + String(i)}
                        dataKey = {field.name}
                        label={field.caption ? field.caption : field.name}
                        width={field.width > 0 ? field.width : 0}
                        // eslint-disable-next-line no-nested-ternary
                        flexGrow={field.flexGrow > 0 ? field.flexGrow : (!(field.width > 0) ? 1 : 0)}
                        style={{ ...field.style }}
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
    minWidth: 600, // 'fit'|NUM
    scrollBarSize: 18,
    showHeader: true,
    headerHeight: 64,
    rowHeight: 32,
    footer: {
        enable: true,
        height: 32,
    },
};
