import redux from 'REDUX';
import * as consts from './consts';

const doAction = (num) => (dispatch) => {
    dispatch({
        type: consts.MOVETO,
        payload: num,
    });
};
const action = (num) => redux.store.dispatch(doAction(num));
export default action;
