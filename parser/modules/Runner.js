import JsonRaw from './JsonRaw.js';
import csv2json from './csv2json.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import CONFIG from '../config.js';

export default class Runner {
    /**
     * @namespace
     * @property {String|null} args.runnerName - name or null of the runner to write to the final file for reporting
     * @property {String} args.originalFile - path to original file
     * @property {Array<String>} args.ignoreFiles - global ignore files
     * @property {String} [args.saveAs] - save as file name
     */
    static config = {
        file: undefined,
        ignoreFiles: [],
        runner: {},
    }

    /**
     * Runner args
     * @namespace
     * @property {Object} args
     * @property {String|null} args.runnerName - name or null of the runner to write to the final file for reporting
     * @property {String} args.originalFile - path to original file
     * @property {String} [args.saveAs] - save as file name
     *
     * @property {Object} raw
     */
    args = {
        metadata: {
            runnerName: null,
            originalFile: null,
            saveAs: null,
        },
        raw: {},
    }

    /**
     * Prettier parser config
     * @namespace
     * @property {Object} prettierConfig
     */
    prettierConfig = {}

    constructor(args) {
        this.args = args;
        this.metadata = this.args.metadata || {};
        this.metadata.runnerName = this.constructor.name;
    }

    run(rawData) {
        return rawData;
    }

    async render() {
        const raw = this.constructor.parse(this.args.raw);
        const data = await this.run(raw);

        if (Array.isArray(data)) {
            this.prettierConfig.printWidth = 5;
        }
        return this._newJson(data);
    }

    _newJson(...args) {
        return new JsonRaw(...args, this.metadata);
    }

    // ===============================
    //              STATIC
    // ===============================

    static multiReadCsv(names) {
        return names.map(Runner.readCsv);
    }

    static parse(s) {
        return csv2json(s);
    }

    /**
     * Загрузить не изменённый ранерами объект
     * @param  {String} fileName  Имя файла, в директории с сырыми данными
     * @return {Object}           Готовый объект
     */
    static readCsv(fileName) {
        const file = readFileSync(`${join(CONFIG.pathRaw, fileName)}.csv`, 'utf8');
        return csv2json(file);
    }

    /**
     * Глубокое слияние объектов
     * @param  {Object} obj1   Объект 1
     * @param  {Object} obj2   Объект 2
     * @return {Object}        Результат, мутация объекта 1
     */
    static combineObjects(obj1, obj2) {
        Object.keys(obj2).forEach((p) =>{
            try {
                if (obj2[p].constructor === Object) {
                    obj1[p] = Runner.combineObjects(obj1[p], obj2[p]);
                } else {
                    obj1[p] = obj2[p];
                }
            } catch (e) {
                obj1[p] = obj2[p];
            }
        });
        return obj1;
    }

    /**
     * Transposing a 2D-array
     * @param {Array<Array>} matrix
     * @return {Array<Array>}
     */
    static transposeMatrix(matrix) {
        return matrix[0].map((x, i) => matrix.map((x) => x[i]));
    }

    /**
     * Из объекта с маленькими объектами в один общий
     * @param  {Object} obj  Объект
     * @return {Object}      Результат
     */
    static compileOne(obj) {
        const res = {};

        Object.values(obj).forEach((e) => {
            Object.entries(e).forEach(([ key, value ]) => {
                if (key in res) {
                    if (Array.isArray(res[key])) {
                        res[key].push(value);
                    } else {
                        res[key] = [ res[key], value ];
                    }
                } else {
                    res[key] = value;
                }
            });
        });

        return res;
    }

    /**
     * Заполнить пространство для соответствия индексам
     * @param  {Object} obj              Подопытный
     * @param  {*} spaceSymbol           Символ для заполнения "пробелов"
     * @param  {Number} to               Нужный результат размера
     * @param  {Boolean} usePush=false   Метод заполнения, в начало или в конец
     * @return {Object}                  Результат
     */
    static fillSpace(obj, spaceSymbol, to, usePush = false) {
        return Object.fromEntries(
            Object.entries(obj).map(([ k, v ]) => {
                if (Array.isArray(v)) {
                    while (v.length < to) {
                        (usePush) ? v.push(spaceSymbol) : v.unshift(spaceSymbol);
                    }
                }
                return [ k, v ];
            }),
        );
    }
}

export function validRunner(config) {
    if (config) { // TODO мб норм валидатор
        return true;
    }
}
