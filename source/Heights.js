import { JX } from 'fmihel-browser-lib';
/**
 * Класс для отложенного расчета высоты строк
 *
*/
export default class Heights {
    constructor() {
        // время между шагами расчета
        this.stepInterval = 1;
        // props объекта Table
        this.props = {};
        // state объекта Table
        this.state = {};
        // сколько будет расчитано на перовм шаге, на последующих будет считаться по одной строке
        this.preCulcCount = 50;

        // ссылка на таймер шага
        this._timerHandler = undefined;
        // текущее положение курсора
        this._current = 0;
        // массив полученных высот
        this._heights = [];
        // массив высот, которые расчитываются, если будет произведен вызов высоты для строки
        this._supper = {};
        // массив ширин столбцов
        this._widths = [];
    }

    _start() {
        const {
            fields, cssHeader,
        } = this.props;
        this._heights = [];
        this._supper = [];
        const { id } = this.state;
        const _$headers = JX.$(`.${cssHeader}`, { group: id, $parent: JX.$(`#${id}`, { group: id }) });
        this._widths = fields.map((field, i) => JX.pos(_$headers[i]).w);
        this._current = 0;
        // eslint-disable-next-line prefer-destructuring
        this.parentDom = JX.$(`#${id}`)[0];
    }

    _stop() {
        if (this.timeHandler) {
            clearTimeout(this.timeHandler);
            this.timeHandler = undefined;
        }
    }

    _culc() {
        const {
            data, footer,
        } = this.props;
        if (this._current < data.length) {
            if (!this.timeHandler) {
                this.timeHandler = setTimeout(() => {
                    this._step();
                    this.timeHandler = undefined;
                    this._culc();
                }, this.stepInterval);
            }
        } else if (this._current === data.length) {
            this._supper = {};
            if (footer.enable) {
                this._heights.push(footer.height);
            }
        }
    }

    _step(forIndex = undefined) {
        const index = forIndex !== undefined ? forIndex : this._current;
        let h;

        if (forIndex === undefined && (String(forIndex) in this._supper)) {
            h = this._supper[String(forIndex)];
        } else {
            const {
                fields, data, footer, rowHeight,
            } = this.props;

            h = (typeof rowHeight === 'function' ? rowHeight({ index }) : rowHeight);

            fields.map((field, i) => {
                if ((field.height === 'stretch') && (!footer.enable || index < data.length)) {
                    const item = data[index];
                    const size = JX.textSize(item[field.name], { width: this._widths[i], refresh: false, parentDom: this.parentDom }); // габариты текста при вписывании в ширину w
                    h = Math.max(size.h, h);
                }
            });
        }
        if (forIndex === undefined) {
            this._heights.push(h);
            this._current++;
        } else {
            this._supper[String(forIndex)] = h;
        }
        return h;
    }

    clear() {
        console.info('clear');
        this._heights = [];
        this._stop();
    }

    needUpdate() {
        return this._heights.length === 0;
    }

    update() {
        this._stop();
        this._start();

        const count = Math.min(this.props.data.length, this.preCulcCount);
        for (let i = 0; i < count; i++) {
            this._step();
        }
        this._culc();
    }

    get(index) {
        if (index < this._heights.length) {
            return this._heights[index];
        }
        if (String(index) in this._supper) {
            return this._supper[String(index)];
        }
        this._stop();
        const h = this._step(index);
        this._culc();
        return h;

        /*
        this._stop();
        const count = Math.min(index + 1, this.props.data.length);
        const start = this._current;
        for (let i = start; i < count; i++) {
            this._step();
        }

        this._culc();

        if (index < this._heights.length) {
            return this._heights[index];
        }
        */
    }
}
