import 'react-virtualized/styles.css';
import { AutoSizer, Column, Table as VirtualTable } from 'react-virtualized';
import React from 'react';
import {
    binds, JX, ut, dvc,
} from 'fmihel-browser-lib';
import _ from 'lodash';
// import ScrollSync from './ScrollSync.jsx';
import ScrollBar from './ScrollBar.jsx';

/**
 * Таблица с фиксированным заголовком
 */
export default class Table extends React.Component {
    constructor(p) {
        super(p);
        binds(this, 'rowGetter',);
        this.state = {
        };
    }
    rowGetter({ index }) {
        return this.props.data[index];
    }

    componentDidMount() {
        // this.componentDidUpdate();
    }

    componentWillUnmount() {
    }

    componentDidUpdate(prevProps) {
    }
    renderScrollBar({height}){
        let {headerHeight} = this.props;
        
        return (
            <div
                style={{
                    boxSizing:'border-box',
                    position: 'absolute',
                    border: '1px solid blue',
                    width: '24px',
                    height: `${height-headerHeight}px`,
                    right: '0px',
                    top:headerHeight+'px'
                }}
            />
        );
    }

    renderTable({ width, height }) {
        let {showHeader,headerHeight,data,fields} = this.props;
        
        let w = width;
        const { minWidth } = this.props;
        if (minWidth !== 'fit' && width < minWidth) { 
            w = minWidth;
        };
        return (
            
            <VirtualTable
                disableHeader={!showHeader}
                headerHeight={headerHeight}
                height = {height}
                width = {w}
                rowHeight={32}
                rowGetter={this.rowGetter}
                rowCount={data.length} 
            >
                {
                    fields.map((field,i)=>{
                        
                        return <Column
                                key={field.name+String(i)}
                                dataKey = {field.name}
                                label={field.caption?field.caption:field.name}
                                width={field.width>0?field.width:0}
                                flexGrow={field.flexGrow>0?field.flexGrow:0} 
                            />
                    })
                }
            </VirtualTable>
        );
            /*
            <div
                id="table"
                style={{
                    boxSizing: 'border-box',
                    position: 'relative',
                    height: `${height}px`,
                    width: `${w}px` 
                }}
            >
            </div>
            */
        }
    render() {  
        // const cCss = _.defaultsDeep(css,Table.defaultProps.css);
        const { minWidth } = this.props;
        const fitStyle = {
            height: '100%',
            width: '100%',
            boxSizing: 'border-box',
            padding: '0px',
            margin: '0px',
        };
        
        return (
            <div style={{ ...fitStyle, overflow: 'hidden' }}>
                <div style={{ ...fitStyle, overflow: 'auto hidden' }}>
                    <AutoSizer>
                        {({ width, height }) => this.renderTable({ width, height })}
                    </AutoSizer>
                </div>
                
                <AutoSizer>
                    {({height})=>this.renderScrollBar({height})}
                </AutoSizer>

            </div>
        );
    }
}


Table.defaultProps = {
    id: undefined,
    css: {
    },
    keyField: false,
    fields: [
        { name: 'ID',width:60 },
        { name: 'NAME', caption: ' name of client',flexGrow:1 },
        { name: 'AGE', caption: ' ages' ,width:100},
    ],
    data: [
        { ID: 1, NAME: 'Mike',AGE:90 },
        { ID: 2, NAME: 'Soma',AGE:7 },
        { ID: 3, NAME: 'Tomy',AGE:23 },
    ],
    minWidth: 500, // 'fit'|NUM
    scrollBarSize: 24,
    showHeader:true,
    headerHeight:32,
};
