import redux from 'REDUX';
import * as consts from './consts';

const doAction = (light) => (dispatch) => {
    dispatch({
        type: consts.SCHEME,
        payload: light,
    });
};
const action = (light) => redux.store.dispatch(doAction(light));
export default action;
