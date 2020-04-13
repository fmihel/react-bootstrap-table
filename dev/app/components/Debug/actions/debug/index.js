import redux from 'REDUX';
import reducer from './reducer';
import action from './action';

redux.add(reducer, { debug: action });
export default action;
