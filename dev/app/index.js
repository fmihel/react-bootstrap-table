import './scss/main.scss';
import { DOM } from 'fmihel-browser-lib';
import React from 'react';
import ReacDOM from 'react-dom';
import { Provider } from 'react-redux';
import redux from 'REDUX';
import App from './App.jsx';
import '@fortawesome/fontawesome-free/js/all';
import './actions';

$(() => {
    ReacDOM.render(<Provider store={redux.store}> <App /></Provider>, DOM('#app'));
});
