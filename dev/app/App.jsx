import React, { Fragment } from 'react';
import {
    flex, binds, JX, dvc, ut,
} from 'fmihel-browser-lib';
import { connect } from 'react-redux';
import Debug from 'COMPONENTS/Debug/Debug.jsx';
import redux from 'REDUX';
import AppFrame from 'COMPONENTS/AppFrame/AppFrame.jsx';
import Table from '../source/Table.jsx';
import getData from '../data/getData';
import {
    fields1, fields2, fields3, fields4,
} from '../data/fields';

class App extends React.Component {
    constructor(p) {
        super(p);
        binds(this, 'onPress', 'onDrawRow', 'onChange', 'onKeyPress', 'onKeyPress2');
        this.num = 0;
        this.state = {
            data: this.props.data,
        };
    }

    onPress() {
        redux.actions.scheme(!this.props.ui.light);
    }

    onKeyPress(o) {
        if (o.key === 'Enter') {
            redux.actions.moveTo(this.num);
        }
    }

    onKeyPress2(o) {
        if (o.key === 'Enter') {
            const len = parseInt($('#length').val(), 10);
            this.setState({ data: getData(this.props.fields, len) });
        }
    }


    onChange(o) {
        this.num = parseInt(o.currentTarget.value, 10);
    }

    onDrawRow(o) {
        if (o.row['ID:NN'] === o.sender.props.moveTo) {
            o.mark = 'select';
        }
    }


    render() {
        const { fields } = this.props;
        const { data } = this.state;
        return (
            <Fragment>
                <AppFrame>
                    <div>
                        <div className='container-fluid'>
                            <div className="row">
                                <div className="col col-sm-3 col-md-2">
                                    <input
                                        onChange={this.onChange}
                                        onKeyPress={this.onKeyPress}
                                        id="moveTo"
                                        type="number"
                                        className="form-control-sm"
                                        placeholder="номер"
                                        style={{ width: '100%' }} />
                                </div>
                                <div className="col col-sm-3 col-md-2">
                                    <input
                                        onKeyPress={this.onKeyPress2}
                                        id="length"
                                        type="number"
                                        className="form-control-sm"
                                        placeholder="длина"
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


const fields = fields1;
App.defaultProps = {
    fields,
    data: getData(fields, 100),
};

export default connect(mapStateToProps)(App);
