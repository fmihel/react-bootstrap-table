import redux from 'REDUX';
import * as consts from './consts';

const doAction = (o) => (dispatch) => {
    dispatch({
        type: consts.DEBUG,
        payload: o,
    });
};
const action = (o) => redux.store.dispatch(doAction(o));
export default action;
