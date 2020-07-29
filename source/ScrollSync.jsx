import PropTypes from 'prop-types';
import * as React from 'react';

/**
 * HOC that simplifies the process of synchronizing scrolling between two or more virtualized components.
 */
export default class ScrollSync extends React.PureComponent {
    constructor(...p) {
        super(...p);

        this.state = {
            clientHeight: 0,
            clientWidth: 0,
            scrollHeight: 0,
            scrollLeft: 0,
            scrollTop: 0,
            scrollWidth: 0,
        };

        this._onScroll = this._onScroll.bind(this);
    }

    render() {
        const { children } = this.props;
        const {
            clientHeight,
            clientWidth,
            scrollHeight,
            scrollLeft,
            scrollTop,
            scrollWidth,
        } = this.state;

        return children({
            clientHeight,
            clientWidth,
            onScroll: this._onScroll,
            scrollHeight,
            scrollLeft,
            scrollTop,
            scrollWidth,
        });
    }

    _onScroll({
        clientHeight,
        clientWidth,
        scrollHeight,
        scrollLeft,
        scrollTop,
        scrollWidth,
    }) {
        this.setState({
            clientHeight,
            clientWidth,
            scrollHeight,
            scrollLeft,
            scrollTop,
            scrollWidth,
        });
    }
}

ScrollSync.propTypes = {
    children: PropTypes.func.isRequired,
};
