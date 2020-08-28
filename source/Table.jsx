import 'react-virtualized/styles.css';
import { AutoSizer, Column, Table as VirtualTable } from 'react-virtualized';
import React from 'react';
import {
    binds, ut, DOM, DOMS, JX,
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

        this.currentScrollTop = 0;
        this.state = {
            id: this.props.id ? this.props.id : ut.random_str(7),
            keyUpdate: ut.random_str(10),
        };
        binds(this,
            '_rowGetter',
            '_onScrollFromScrollBar',
            '_rowHeight',
            '_onPressUp',
            '_onPressDown',
            '_onCulc',
            '_doScrollTable',
            'scrollTo');
        this.heightWorker = new Heights({
            onCulc: this._onCulc,
            owner: this,
            state: this.state,
            props: this.props,
        });
    }

    /** виден ли нижний(горизонтальны) scrollbar */
    visibleHorizScrollBar() {
        return (this.refFrame.current) ? (this.refFrame.current.offsetWidth < this.tableWidth) : false;
    }

    visibleVertScrollBar() {
        return (this.refFrame.current) ? (this.refFrame.current.offsetHeight < this.tableHeight) : false;
    }

    _rowGetter({ index }) {
        if (index < this.props.data.length) {
            if (this.heightWorker.indexIsCulc(index)) {
                return this.props.data[index];
            }
            return { 'ID:NN': 'loading..' };
        }
        const keys = Object.keys(this.props.data[0]);
        const footer = {};
        // eslint-disable-next-line array-callback-return
        keys.map((name) => { footer[name] = ''; });
        return footer;
    }

    _rowHeight(o) {
        if (this.heightWorker.notInit()) {
            this.heightWorker.init();
        }

        return this.heightWorker.get(o.index);
    }

    _onCulc(o) {
        if (this.props.onCulc) {
            this.props.onCulc(o);
        }
    }

    _onPressUp() {
        this.refTable.current.scrollToPosition(this.currentScrollTop - 10);
    }

    _onPressDown() {
        this.refTable.current.scrollToPosition(this.currentScrollTop + 10);
    }

    // высота видимой области отображения таблицы
    height() {
        const dom = DOM('.ReactVirtualized__Grid', this.refFrame.current);
        return JX.pos(dom).h;
    }

    // ширина видимой области отображения таблицы
    width() {
        return JX.pos(this.refFrame.current).w;
    }

    scrollTo(o) {
        let p;
        if (o === 'top') {
            p = { index: 0 };
        } else if (o === 'bottom') {
            p = { index: this.props.data.length - 1 };
        } else {
            p = { ...o };
        }
        if ('index' in p) {
            this.heightWorker.scrollTo(p);
        } else if ('top' in p) {
            this.refTable.current.scrollToPosition(p.top);
        } else if ('off' in p) {
            this.refTable.current.scrollToPosition(this.currentScrollTop + p.off);
        }
    }

    /** получить видимую строку */
    getVisibleRow(o = {}) {
        const p = {
            align: 'top',
            ...o,
        };
        const grid = DOM('.ReactVirtualized__Grid', this.refFrame.current);
        const rows = DOMS('.ReactVirtualized__Table__row', grid);
        const height = this.height();
        let prev;
        for (let i = 0; i < rows.length; i++) {
            if (p.align === 'top') {
                if (parseInt(rows[i].style.top, 10) - this.currentScrollTop > 0) {
                    return rows[i].ariaRowIndex - 1;
                }
            } else if (p.align === 'bottom') {
                if (parseInt(rows[i].style.top, 10) - this.currentScrollTop > height) {
                    return prev ? prev.ariaRowIndex - 1 : rows[i].ariaRowIndex - 1;
                }
                prev = rows[i];
            }
        }
        return -1;
    }

    componentDidMount() {
        this.resizeObserver = new ResizeObserver(() => {
            this.heightWorker.refreshAll();
        });
        this.resizeObserver.observe(this.refFrame.current);
    }

    componentWillUnmount() {
        if (this.resizeTimer) clearTimeout(this.resizeTimer);
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }

    componentDidUpdate() {
        // if (this.repeat) this.onResize(true);
    }

    _onScrollFromScrollBar({ scrollTop }) {
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
                    height: `${height - headerHeight - (this.visibleHorizScrollBar() ? scrollBarSize - 2 : 0)}px`,

                    right: '0px',
                    top: `${headerHeight}px`,
                }}
                height={scrollHeight - clientHeight }
                top={scrollTop}
                onScroll={this._onScrollFromScrollBar}
                theme={theme}
                onPressUp={this._onPressUp}
                onPressDown={this._onPressDown}
            />
        );
    }

    _doScrollTable(...p) {
        this.heightWorker.onScroll(...p);
        if (this.onScrollTable) {
            this.currentScrollTop = p[0].scrollTop;
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
                rowHeight={this._rowHeight}
                rowGetter={this._rowGetter}
                rowCount={data.length + ((cFooter.enable && data.length > 0) ? 1 : 0)}
                onScroll={this._doScrollTable}
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
    minWidth: 1000, // 'fit'|NUM
    scrollBarSize: 18,
    showHeader: true,
    headerHeight: 64,
    rowHeight: 32,
    footer: {
        enable: true,
        height: 32,
    },
    onCulc: undefined,
};
