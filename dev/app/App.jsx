import React, { Fragment } from 'react';
import {
    flex, binds, JX, dvc, ut,
} from 'fmihel-browser-lib';
import { connect } from 'react-redux';
import Debug from 'COMPONENTS/Debug/Debug.jsx';
import redux from 'REDUX';
import AppFrame from 'COMPONENTS/AppFrame/AppFrame.jsx';
import Table from '../table/Table.jsx';
import getData from '../data/getData';
import {
    fields1, fields2, fields3, fields4,
} from '../data/fields';

class App extends React.Component {
    constructor(p) {
        super(p);
        binds(this, 'onPress', 'onDrawRow', 'onChange', 'onKeyPress');
        this.state = {
            num: '',
            numInt: false,
        };
    }

    onPress() {
        redux.actions.scheme(!this.props.ui.light);
    }

    onKeyPress(o) {
        if (o.key === 'Enter') {
            redux.actions.moveTo(this.state.num);
        }
    }

    onChange(o) {
        const num = parseInt(o.currentTarget.value, 10);
        this.setState({ num });
    }

    onDrawRow(o) {
        if (o.row['ID:NN'] === o.sender.props.moveTo) {
            o.mark = 'select';
        }
    }


    render() {
        const { data, fields } = this.props;

        return (
            <Fragment>
                <AppFrame>
                    <div>
                        <div className='container-fluid'>
                            <div className="row">
                                <div className="col col-sm-3 col-md-2">
                                    <input
                                        value={this.state.num >= 0 ? this.state.num : ''}
                                        onChange={this.onChange}
                                        onKeyPress={this.onKeyPress}
                                        id="moveTo"
                                        type="number"
                                        className="form-control-sm"
                                        placeholder="номер"
                                        style={{ width: '100%' }} />
                                </div>
                                <div className="col-auto" >
                                    <button
                                        onClick={this.onPress}
                                        className="btn btn-secondary btn-sm"
                                        style={{ whiteSpace: 'nowrap' }}>
                                        <i className="far fa-address-book"></i> {this.props.ui.light ? 'LIGHT/dark' : 'light/DARK'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <Table
                            moveTo={this.props.table.moveTo}
                            data={data}
                            fields={fields}
                            light={this.props.ui.light}
                            css={'table-sm table-bordered table-striped table-hover'}
                            onDrawRow={this.onDrawRow}

                        />

                    </div>
                </AppFrame>
                <Debug/>
            </Fragment>
        );
    }
}

const mapStateToProps = (state) => ({
    table: state.table,
    ui: state.ui,
});


const fields = fields2;
App.defaultProps = {
    fields,
    data: getData(fields, 1000000),
};

export default connect(mapStateToProps)(App);
