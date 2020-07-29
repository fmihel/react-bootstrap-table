import React, { Fragment } from 'react';
import {
    binds, flex,
} from 'fmihel-browser-lib';
// eslint-disable-next-line import/no-extraneous-dependencies
import { connect } from 'react-redux';

// import Debug from 'COMPONENTS/Debug/Debug.jsx';
import redux from 'REDUX';
import '../style/scss';
import getData from './data/getData';
import {
    // eslint-disable-next-line no-unused-vars
    fields1, fields2, fields3, fields5,
} from './data/fields';
import Table from '../source/Table.jsx';

class App extends React.Component {
    constructor(...p) {
        super(...p);
        binds(this, 'onPress', 'cssRow', 'UpdateTable');
        this.num = undefined;
        this.refTable = React.createRef();

        this.state = {
            data: this.props.data,
            padding: 0,
        };
    }

    onPress() {
        redux.actions.scheme(!this.props.ui.light);
    }

    cssRow({ index }) {
        return `table-row${index & 1 ? ' table-row-2' : ''}`;
    }

    UpdateTable() {
        this.refTable.current.onResize(true);
    }

    render() {
        const { fields, data } = this.props;

        return (
            <div className="container-fluid" style={{ ...flex('vert') }}>
                <div className="row" style={{ padding: '5px' }}>
                    <div className="col" style={{ minHeight: '32px' }}>
                        <button className='btn btn-primary' onClick={this.UpdateTable}>update</button>
                    </div>
                </div>
                <div className="row">
                    <div className="col" style={{ minHeight: '32px' }}>
                    </div>
                </div>
                <div className="row" style={{ ...flex('stretch') }}>
                    <div className="col-1"/>
                    <div className="col"
                        style={{ border: '1px solid gray' }}
                    >
                        <Table
                            ref = {this.refTable}
                            fields={fields}
                            data={data}
                            css="frame-table"
                            theme="dark"
                            cssRow={this.cssRow}
                        />
                    </div>
                    <div className="col-1"/>
                </div>
                <div className="col" style={{ maxHeight: '32px', minHeight: '32px' }}>

                </div>

            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    table: state.table,
    ui: state.ui,
});

const fields = fields5;
App.defaultProps = {
    fields,
    data: getData(fields, 1000),

};

export default connect(mapStateToProps)(App);
