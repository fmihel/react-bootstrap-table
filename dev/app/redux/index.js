import { Redux } from 'fmihel-redux-wrapper';

const init = {
    table: {
        start: 0,
        count: 50,
        scroll: 'none',
    },
};
const redux = new Redux(init);
export default redux;
