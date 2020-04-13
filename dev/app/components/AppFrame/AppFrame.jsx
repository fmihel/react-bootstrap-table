import React, { Fragment } from 'react';
import {
    JX, flex, binds, dvc,
} from 'fmihel-browser-lib';

export default class AppFrame extends React.Component {
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
        /** смещение кнопки по горизонтали, если присутствует скролинг */
        this.$get('#panel').toggle(0, () => {
            const b = this.$get('.btn-collapse');
            b.toggleClass('fa-flip-horizontal');

            const css = { right: '0px' };
            const c = this.$get('.content');
            if ((b.hasClass('fa-flip-horizontal')) && (!dvc.mobile)) {
                if (c[0].scrollHeight > c[0].clientHeight) css.right = '1.05rem';
                console.info('c', c[0].scrollHeight, c[0].clientHeight, css);
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
        const childs = React.Children.toArray(this.props.children);
        // console.info(childs);
        return (
            <Fragment>
                <div className="container-fluid" style={{ ...flex('vert') }}>
                    <div className="row" id="panel">
                        <div className="col">
                            <div className="card text-white bg-dark ">
                                <div className="card-body">
                                    {childs[0].props.children}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row content" style={{ ...flex('stretch') }}>
                        <div className="col" style={{ maxHeight: '100%', overflow: 'hidden' }}>
                            {childs[1].props.children}

                        </div>
                    </div>
                </div>
                <div className="btn btn-collapse btn-secondary" onClick={this.onCollapse}><i className="fas fa-angle-double-right"></i></div>
            </Fragment>
        );
    }
}
AppFrame.defaultProps = {
// default
};
