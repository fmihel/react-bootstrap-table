import React, { Fragment } from 'react';
import {
    binds,
} from 'fmihel-browser-lib';
// eslint-disable-next-line import/no-extraneous-dependencies
import { connect } from 'react-redux';

// import Debug from 'COMPONENTS/Debug/Debug.jsx';
import redux from 'REDUX';
import AppFrame from 'COMPONENTS/AppFrame/AppFrame.jsx';
import Table from '../source/Table.jsx';
import '../style/scss';
import getData from './data/getData';
import {
    // eslint-disable-next-line no-unused-vars
    fields1, fields2, fields3, fields4,
} from './data/fields';

class App extends React.Component {
    constructor(p) {
        super(p);
        binds(this,
            'onPress',
            'onDrawRow',
            'onDrawCol',
            'onChange',
            'onKeyPress',
            'onKeyPress2',
            'onShowHeader',
            'onVertical');
        this.num = undefined;
        this.state = {
            data: this.props.data,
            showHeader: true,
            vertical: true,
        };
    }

    onVertical() {
        this.setState((prev) => ({ vertical: !prev.vertical }));
    }

    onShowHeader() {
        this.setState((prev) => ({ showHeader: !prev.showHeader }));
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
        if (o.sender.props.data['ID:NN'] === this.num) {
            // eslint-disable-next-line no-param-reassign
            o.mark = 'select';
        }
    }

    onDrawCol(o) {
        // eslint-disable-next-line eqeqeq
        if (o.sender.props.field.name === 'NAME' && o.sender.props.data['ID:NN'] == 1) {
            // eslint-disable-next-line no-param-reassign
            o.style = { color: 'red' };
        }
    }


    render() {
        const { fields } = this.props;
        const { data, showHeader, vertical } = this.state;
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
                                <div className="col-auto" >

                                    <div className="form-group form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="cbShowHeader"
                                            checked={this.state.showHeader}
                                            onChange={this.onShowHeader}
                                        />
                                        <label className="form-check-label" htmlFor="cbShowHeader">Header</label>
                                    </div>
                                    <div className="form-group form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="cbVertical"
                                            checked={vertical}
                                            onChange={this.onVertical}
                                        />
                                        <label className="form-check-label" htmlFor="cbVertical">Vertical</label>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                    <div>
                        <Table
                            moveTo={this.props.table.moveTo}
                            data={data}
                            fields={fields}
                            css={{
                                add: 'table-sm table-bordered table-striped table-hover',
                                theme: this.props.ui.light ? 'light' : 'dark',
                            }}

                            onDrawRow={this.onDrawRow}
                            onDrawCol={this.onDrawCol}
                            showHeader={showHeader}
                            vertical={vertical}
                        />
                    </div>
                </AppFrame>
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
