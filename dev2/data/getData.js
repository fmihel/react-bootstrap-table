import { ut } from 'fmihel-browser-lib';

function isNumeric(num) {
    return !isNaN(num);
}

function randomText(count = 10) {
    let out = '';
    for (let i = 0; i < count; i++) {
        const len = ut.random(5, 20);
        out += (out !== '' ? ' ' : '') + ut.random_str(len);
    }
    return out;
}
function getInfo(field) {
    const pos = field.indexOf(':');
    if (pos < 0) { return { type: 'string', count: 0 }; }
    const def = field.substring(pos + 1);
    if (isNumeric(def)) return { type: 'string', count: def };
    return { type: def };
}

/** return data for table
 *  fields = [{name:STRING1},{name:STRING2},..]
 *
*/
export default function getData(fields, count) {
    const res = [];
    for (let i = 0; i < count; i++) {
        const row = {};
        fields.forEach((field) => {
            const info = getInfo(field.name);
            let val = '';
            if (info.type === 'string') val = info.count === 0 ? randomText(5) : ut.random_str(info.count);
            if (info.type === 'NN') val = i;
            if (info.type === 'NUM') val = ut.random(0, 1000);
            if (info.type === 'DATA') val = `${ut.random(10, 20)}/${ut.random(10, 20)}/${ut.random(10, 20)}`;

            row[field.name] = val;
        });
        res.push(row);
    }
    return res;
}
