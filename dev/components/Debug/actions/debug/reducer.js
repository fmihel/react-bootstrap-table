import redux from 'REDUX';
import * as consts from './consts';


const is = (action) => Object.keys(consts).indexOf(action.type) >= 0;
const reducer = (state, action) => {
    if (action.type === consts.DEBUG) {
        return redux.change(state)
            .extend({ debug: { list: action.payload } })
            .state;
    }


    return state;
};

export default { is, reducer };
