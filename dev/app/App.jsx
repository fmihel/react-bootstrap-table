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
        binds(this, 'onPress', 'onDrawRow');
    }

    onPress() {
        redux.actions.moveTo(parseInt($('#moveTo').val(), 10));
    }

    onDrawRow(o) {
        if (o.row['ID:NN'] == o.sender.props.moveTo) {
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
                                    <input id="moveTo" type="number" className="form-control-sm" placeholder="номер" style={{ width: '100%' }}/>
                                </div>
                                <div className="col" >
                                    <button onClick={this.onPress} className="btn btn-secondary btn-sm" style={{ whiteSpace: 'nowrap' }}><i className="far fa-address-book"></i> press</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <Table
                            moveTo={this.props.reduxData.table.moveTo}
                            data={data}
                            fields={fields}
                            light={false}
                            css={'table-sms table-bordered'}
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
    reduxData: state,
});


const fields = fields2;
App.defaultProps = {
    fields,
    data: getData(fields, 1000),
};

export default connect(mapStateToProps)(App);
