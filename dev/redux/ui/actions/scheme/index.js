import redux from 'REDUX';
import reducer from './reducer';
import action from './action';

redux.add(reducer, { scheme: action });
export default action;
