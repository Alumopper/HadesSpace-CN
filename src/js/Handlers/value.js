import rules from '@Regulation/formatValueRules.js';
import { regex as postfixRegex } from '@Regulation/postfixes.mjs';

const numberFormat = new Intl.NumberFormat('ru-RU').format;

export default function(key, value, dataName) {
    const fixedKey = key
        .replace(/^_/, '')
        .replace(postfixRegex, '');

    if (value === undefined || value === null) {
        return;
    }
    for (const [keys, func, dataNames = []] of rules) {
        if (dataNames.includes(dataName) && ((keys[0] === '*' ) ? true : keys.includes(fixedKey || key))) {
            return func(value);
        }
        if (!dataNames.length && keys.includes(fixedKey || key)) {
            return func(value);
        }
    }
    if (Number.isInteger(value)) {
        return numberFormat(value);
    }
    return value;
}
