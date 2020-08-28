/* eslint-disable prefer-destructuring */
/* eslint-disable no-return-assign */
import { JX } from 'fmihel-browser-lib';
/**
 * Класс для отложенного расчета высоты строк
 *
*/
export default class Heights {
    constructor(o) {
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

        this.fastTo = false;
        this.fastLim = 20;
        this.fastRow = [];
        this.onCulc = undefined;
        this.fasts = {};

        this._stepIndex = 0;

        this.owner = undefined;

        // переопределение параметров параметрами извне
        const keys = o ? Object.keys(o) : [];
        keys.map((key) => this[key] = o[key]);
    }

    /**
     * инициализация перед старотом пересчета высот
    */
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
        this._stepIndex = 0;

        this.parentDom = JX.$(`#${id}`)[0];
    }

    /**
     * полная остановка механизма пересчета, без сброса расчитанных параметров
    */
    _stop() {
        if (this.timeHandler) {
            clearTimeout(this.timeHandler);
            this.timeHandler = undefined;
        }
    }

    /** завпуск механзма пошагового пересчета высот */
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
            if (this.fastLastIndex !== undefined) {
                this.fasts = {};
                this.owner.refTable.current.recomputeRowHeights(this.fastLastIndex);
                this.fastLastIndex = undefined;

                this.scrollTo({ index: this.fastState.index });
            }
        }
    }

    _isCulcFinish() {
        const { data, footer } = this.props;
        return this._heights.length === data.length + (footer.enable ? 1 : 0);
    }

    /** шаг расчета, расчет произволится как для текущего значения строки, так и для конкретно указанного,
     * во втором случае высота записывается в отдельный массив _supper
     */
    _step(forIndex = undefined) {
        const index = forIndex !== undefined ? forIndex : this._current;
        let h;

        if ((forIndex === undefined) && (String(index) in this._supper)) {
            h = this._supper[String(index)];
        } else {
            const {
                fields, data, footer, rowHeight,
            } = this.props;

            if (this.onCulc) {
                this.onCulc({ step: this._stepIndex, count: data.length });
                this._stepIndex++;
            }

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
            this._supper[String(index)] = h;
        }

        return h;
    }

    onScroll(...p) {
        if (this.fastState) {
            if (!this.fastState.none) {
                this.fastState = { index: this.owner.getVisibleRow() };
            } else {
                this.fastState.none = false;
            }
        }
    }

    /** сброс расчитанных параметров, в таком случае, при следующем вызове get снова будет запущен механиз расчета высот */
    clear() {
        this._heights = [];
        this._supper = {};
        this.fasts = {};
        this._stop();
    }

    /** признак того, что необходимо запустить перерасчет */
    notInit() {
        return this._heights.length === 0;
    }

    /** запуск перерасчета */
    init() {
        this._stop();
        this._start();

        const count = Math.min(this.props.data.length, this.preCulcCount);
        for (let i = 0; i < count; i++) {
            this._step();
        }
        this._culc();
    }

    /** полное обновление  */
    refreshAll(o) {
        const a = {
            ...o,
            delay: 200,
        };
        if (this._recomputePos === undefined) {
            this._recomputePos = this.owner.getVisibleRow();
        }

        if (this._recomputeStart) {
            clearTimeout(this._recomputeStart);
            this._recomputeStart = undefined;
        }
        this._recomputeStart = setTimeout(() => {
            this.clear();
            this.owner.refTable.current.recomputeRowHeights(0);
            // this.owner.scrollTo({ index: this._recomputePos });
            this._recomputePos = undefined;
        }, a.delay);
    }

    /** скролинг в позицию {index:NUM}
     *  скролинг может произойти в момент когда еще не все высоты просчитаны, поэтому,
     *  после скролинга может потребоваться перерисовка недорисованных высот с их пересчетом
    */
    scrollTo(o) {
        if ('index' in o) {
            if (this._isCulcFinish()) {
                const current = this.owner.getVisibleRow();
                let index = o.index;
                // если скролинг идет с меньшего индекса на больший, то запускаем алгоритм
                // поиск доп смещения, чтобы позиционируемая строка всегда была сверху
                // при смещении с большего индекса на меньший, это происходит автоматически
                if (current < index) {
                    const height = this.owner.height();
                    // поиск строки реально до какой будет смещение
                    let h = 0;
                    while (index < this._heights.length) {
                        if (this._heights[index] + h > height) { index--; break; }
                        h += this._heights[index];
                        index++;
                    }
                }
                this.owner.refTable.current.scrollToRow(index);
            } else {
                const idx = this._heights.length - 1;
                // расчитаем индекс, от которого необходимо будет запустить алгоритм пересчета
                // последний, для которого был произведен нормальный расчет
                this.fastLastIndex = this.fastLastIndex === undefined ? idx : Math.min(idx, this.fastLastIndex);
                const current = this.owner.getVisibleRow();
                let index = o.index;
                if (current < o.index) {
                    const height = this.owner.height();
                    // поиск строки реально до какой будет смещение
                    let h = 0;

                    while (index < o.index + this.fastLim) {
                        const getH = this.get(index);
                        if (getH + h > height) { index--; break; }
                        h += getH;
                        index++;
                    }
                }

                this.fastTo = o.index;
                this.owner.refTable.current.scrollToRow(index);
                this.fastTo = false;
                this.fastState = { index: o.index, none: true };
            }
        }
    }

    /** признак, что строка расчитана */
    indexIsCulc(index) {
        return !(String(index) in this.fasts);
    }

    /** получение высоты, для строки index */
    get(index) {
        if (String(index) in this.fasts) {
            return this.fasts[String(index)];
        }

        if (index < this._heights.length) {
            return this._heights[index];
        }

        if (String(index) in this._supper) {
            return this._supper[String(index)];
        }

        // если включено быстрое скролирование, то для всех строк ( в пределах fastTo+-datsLim)
        // возвращаем фиксированное значение
        if (this.fastTo !== false) {
            if ((index < this.fastTo - this.fastLim) || (index > this.fastTo + this.fastLim)) {
                const midHeight = 32;
                this.fasts[String(index)] = midHeight;
                return midHeight;
            }
        }

        this._stop();
        const h = this._step(index);
        this._culc();
        return h;
    }
}
