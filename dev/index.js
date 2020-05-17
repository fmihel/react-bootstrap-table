import './scss/main.scss';
import 'fmihel-polyfills';
import 'bootstrap';
import { DOM } from 'fmihel-browser-lib';
import React from 'react';
import ReacDOM from 'react-dom';
import { Provider } from 'react-redux';
import redux from 'REDUX';
import App from './App.jsx';
import "./actions";

$(() => {
    ReacDOM.render(<Provider store={redux.store}> <App /></Provider>, DOM('#app'));
});
