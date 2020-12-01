import prettier from 'prettier';
import {existsSync, mkdirSync} from 'fs';
import {writeFile} from 'fs/promises';
import {dirname} from 'path';
import NestedRawJson from './NestedRawJson.js';
import byTypes from '../plugins/modification/byTypes.js';

/**
 * Сохранить в файл
 * @param  {Object} json  Объект, который будем сохранять
 * @return {Promise<void>}
 */
export default function saveFile(json) {
  const addData = addContent(json);
  const pluginName = (json.metadata.pluginName)? `+ ${json.metadata.pluginName}.js plugin` : '';
  const file = json.metadata.saveAs;
  let parser = 'babel';
  delete json.metadata;
  let content = `
      // generated by generateGameData/index.js ${pluginName}

      let data = ${JSON.stringify(json, null, 2)}

      ${addData.content || ''}

      module.exports = {${addData.export}}
      `;

  if (!existsSync(dirname(file))) {
    mkdirSync(dirname(file));
  }
  if (file.split('.').pop() === 'json') {
    content = JSON.stringify(json, null, 2);
    parser = 'json';
  }
  return writeFile(
      file,
      prettier.format(content, {
        parser: parser,
        trailingComma: 'es5',
        printWidth: 410, // чтоб массивы выстраивались в одну линию
      }))
      .then(() => {
        console.log('Файл', `"\x1b[32m${file}\x1b[0m"`, 'создан');
      })
      .catch((err) => {
        throw err;
      });

  // добавить захардкоженый контент
  function addContent(json) {
    const needData = json.metadata.originalFile.replace(/.*\/(.+)\..+$/, '$1');
    const byType = byTypes[needData] || {};
    const result = {};
    let registered = [];

    result.export = 'data';
    if (json[Object.keys(json)[0]].constructor !== NestedRawJson) {
      return result; // нет вложенных объектов - просто данные
    }
    Object.keys(byType)
        .forEach((key) => registered = registered.concat(byType[key]));
    const notRegistered = Object.keys(json)
        .filter((key) => !registered.includes(key));
    if (notRegistered.length !== 0) {
      if (Object.keys(byType).length !== 0) {
        byType.notregistered = notRegistered;
      } else {
        byType.default = notRegistered;
      }
    }
    result.content = `let byTypes= ${JSON.stringify(byType, null, 2)}`;
    result.export += ', byTypes';
    return result;
  }
}
