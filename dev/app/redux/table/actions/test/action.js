import redux from 'REDUX';
import * as consts from './consts';

const doAction = (payload = {}) => (dispatch) => {
    dispatch({
        type: consts.TEST,
        payload,
    });
};
const action = (payload) => redux.store.dispatch(doAction(payload));
export default action;
