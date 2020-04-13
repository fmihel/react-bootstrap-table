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
        binds(this, 'onPress');
    }

    onPress() {
        redux.actions.test({
            start: 25,
            count: 75,
            scroll: 'bottom',
        });
    }

    render() {
        const { data, fields } = this.props;

        return (
            <Fragment>
                <AppFrame>
                    <div>
                        <button onClick={this.onPress} className="btn btn-secondary btn-sm"><i className="far fa-address-book"></i> press</button>
                    </div>
                    <div>
                        <Table data={data} fields={fields} light={false} css={'table-sm table-bordered'}/>

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
    data: getData(fields, 800),
};

export default connect(mapStateToProps)(App);
