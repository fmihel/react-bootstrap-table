import React, { Fragment } from 'react';
import { flex, binds, JX } from 'fmihel-browser-lib';
import Table from '../table/Table.jsx';

export class App extends React.Component {
    constructor(p) {
        super(p);
        binds(this, 'onCollapse', 'updateHeightBtnCollapse');
        this.jq = {};
        JX.window.on('resize', () => { this.updateHeightBtnCollapse(); });
    }

    $get(name) {
        if ((!(name in this.jq)) || (!this.jq[name].length)) {
            this.jq[name] = $(name);
        }
        return this.jq[name];
    }

    onCollapse() {
        this.$get('#panel').toggle(200, () => { this.$get('.btn-collapse').toggleClass('fa-flip-horizontal'); });
    }

    componentDidMount() {
        this.updateHeightBtnCollapse();
    }

    updateHeightBtnCollapse() {
        const h = this.$get('#panel').height();
        this.$get('.btn-collapse').css({ height: `${h}px`, lineHeight: `${h}px` });
    }

    render() {
        return (
            <Fragment>
                <div className="container-fluid" style={{ ...flex('vert') }}>
                    <div className="row" id="panel">
                        <div className="col">
                            <div className="card text-white bg-dark ">
                                <div className="card-body">
                                    <button className="btn btn-secondary btn-sm"><i className="far fa-address-book"></i> press</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row" style={{ ...flex('stretch') }}>
                        <div className="col content">
                            <Table/>
                        </div>
                    </div>
                </div>
                <div className="btn btn-collapse btn-secondary" onClick={this.onCollapse}><i className="fas fa-angle-double-right"></i></div>
            </Fragment>
        );
    }
}
