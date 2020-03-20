import React, { Fragment } from 'react';
import {
    flex, binds, JX, dvc,
} from 'fmihel-browser-lib';
import Table from '../table/Table.jsx';
import getData from '../data/getData';
import { fields1 } from '../data/fields';

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
        this.$get('#panel').toggle(200, () => {
            const b = this.$get('.btn-collapse');
            b.toggleClass('fa-flip-horizontal');
            /** смещение кнопки по горизонтали, если присутствует скролинг */
            let css = { right: '0px' };
            const c = this.$get('.content');
            if ((b.hasClass('fa-flip-horizontal')) && (!dvc.mobile)) {
                if (c[0].scrollHeight > c[0].clientHeight) css = { right: '0.95rem' };
            }
            b.css(css);
        });
    }

    componentDidMount() {
        this.updateHeightBtnCollapse();
    }

    updateHeightBtnCollapse() {
        const h = this.$get('#panel').height();

        this.$get('.btn-collapse').css({ height: `${h}px`, lineHeight: `${h}px` });
    }

    render() {
        const { data, fields } = this.props;
        console.info(data);
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
                    <div className="row content" style={{ ...flex('stretch') }}>
                        <div className="col">
                            <Table data={data} fields={fields}/>
                        </div>
                    </div>
                </div>
                <div className="btn btn-collapse btn-secondary" onClick={this.onCollapse}><i className="fas fa-angle-double-right"></i></div>
            </Fragment>
        );
    }
}
const fields = fields1;
App.defaultProps = {
    fields,
    data: getData(fields, 200),
};
