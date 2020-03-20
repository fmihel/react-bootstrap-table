import './scss/main.scss';
import { DOM } from 'fmihel-browser-lib';
import React from 'react';
import ReacDOM from 'react-dom';
import { App } from './App.jsx';
import '@fortawesome/fontawesome-free/js/all';

$(() => {
    ReacDOM.render(<App/>, DOM('#app'));
});
