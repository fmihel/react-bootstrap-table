import { Redux } from 'fmihel-redux-wrapper';

const init = {
    table: {
        start: 0,
        count: 50,
        scroll: 'none',
        moveTo: false,
    },
};
const redux = new Redux(init);
export default redux;
