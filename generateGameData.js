
const fs = require('fs');
const prettier = require('prettier');

const pathCSVs = './rawData/csv/';
const pathSave = './data/';
const pluginsPath = './plugins/';
const optionalFiles = ['projectiles.csv', 'ship_spawners.csv', 'solar_system_gen_data.csv'];
const isWhiteListBS = require(`${pathCSVs}modification/fixValue.js`).isWhiteListBS;
const dataByTypes = require(`${pathCSVs}modification/byTypes.js`);
const fixValue = require(`${pathCSVs}modification/fixValue.js`);
const isHide = require(`${pathCSVs}modification/fixValue.js`).isHide;
global.ignoringHeaders = ['maxLevel', 'Name', 'TID', 'TID_Description', 'Icon', 'SlotType', 'Model'];

module.exports = {
  combineObjects,
  renameKeys,
  isHide,
  compileOne,
  fillSpace,
  pushArrays,
  fixValue,
  dataByTypes,
  readCSV,
  isWhiteListBS,
};

const f = ['capital_ships'];
generateFiles(
    pathCSVs,
    pathSave,
    f,
);

async function generateFiles(pathCSVs, pathSave, files) {
  const startTime = new Date().getTime();

  if (!files || files.length == 0) {
    files = fs.readdirSync(pathCSVs)
        .filter((e) => (e != undefined && !optionalFiles.includes(e) && e.endsWith('.csv')))
        .map((e) => e.replace(/(.*)\.csv/, '$1'));
  }
  const plugins = fs.readdirSync(pluginsPath)
      .filter((e) => e.endsWith('.js'))
      .map((e) => e.replace(/(.*)\.js/, '$1'));

  const promises = files.map(loadSaveFile);
  await Promise.all(promises) // .then() не хочет работать
      .catch((error) => console.log(`Ошибки в выполнении. \n ${error}`));
  const time = (new Date().getTime() - startTime) / 1000;
  console.log(`Готово! (${time} сек.)`);

  function loadSaveFile(file) {
    return new Promise((resolve, reject) => {
      fs.readFile(`${pathCSVs + file}.csv`, 'utf8', (err, data) => {
        if (err) return reject(`Ошибка загрузки файла "${file}": ${err}`);
        let json = CSVtoJSON(data);
        let pluginName;

        for (const i of plugins) {
          if (i == file) {
            json = require(`${pluginsPath + i}.js`)(json);
            pluginName = i;
          }
        }
        saveToFile(`${pathSave}${file}.js`, fixOrder(json), pluginName);
        resolve();
      });
    });
  }
}
function saveToFile(file, jsonObj, pluginName = null) {
  const name = file.replace(/.*\/(.*)\.js/, '$1');
  const addData = addContent(jsonObj, name);
  pluginName = (pluginName)? `+ ${pluginName}.js plugin` : '';

  const content = `
// generated by ${__filename} ${pluginName}
// at ${new Date().toDateString()}

let data = ${JSON.stringify(jsonObj, null, 2)}

${addData.content || ''}

export {${addData.export}}
`;
  fs.writeFile(
      file,
      prettier.format(content, {
        parser: 'babel',
        trailingComma: 'es5',
        printWidth: 410, // чтоб массивы выстраивались в одну линию
      }),
      () => console.log(`Файл "${file}" создан`),
  );
}
function readCSV(path) {
  return CSVtoJSON(fs.readFileSync(`${pathCSVs + path}.csv`, 'utf8'));
}
// парсер из таблицы в обектJS
function CSVtoJSON(csv) {
  const data = csv.split('\n');
  const headers = data[0].split(',');
  const jsonObj = {};
  let name = null;

  if (headers.length == 1) return simpleArray(data);
  for (let i = 1; i < data.length; i++) {
    const string = data[i].split(',');

    if (string == '') continue;
    if (string[0] !== '') {
      name = string[0];
      jsonObj[name] = {};
      jsonObj[name].maxLevel = 1;
    } else {
      jsonObj[name].maxLevel++;
    }
    for (let j = 0; j < string.length; j++) {
      const header = headers[j].trim();
      let value = string[j].trim();
      const stokValue = jsonObj[name][header];

      if (isTrashHeader(header) || value === undefined || value === '') continue;
      value = fixValue(name, header, value);
      if (value == null) continue;
      if (stokValue == undefined || stokValue === '') {
        jsonObj[name][header] = value;
      } else if (Array.isArray(stokValue)) {
        jsonObj[name][header].push(value);
      } else {
        jsonObj[name][header] = [];
        jsonObj[name][header].push(stokValue, value);
      }
    }
  }
  return removeDupsFromArrays(jsonObj);
}
// массив, сравнивать i и i+1, если все элементы равны установить вместо массива i[0] || {key:[1,1,1,1]} => {key:1}
function removeDupsFromArrays(obj) {
  const names = Object.keys(obj);
  for (const name of names) {
    const headlers = Object.keys(obj[name]);
    for (const headler of headlers) {
      const item = obj[name][headler];
      if (!Array.isArray(item)) continue;
      let isBreak = false;
      for (let i = 0; i < item.length; i++) {
        if (item[i] !== item[i + 1] && item[i + 1] !== undefined) {
          isBreak = true; // пока хз как лучше
          break;
        }
      }
      if (!isBreak) {
        obj[name][headler] = item[0];
      }
    }
  }
  return obj;
}
// добавить захардкоженый контент
function addContent(obj, needData) {
  const byType = dataByTypes[needData] || {};
  const result = {};
  const registered = [];
  const notRegistered = [];

  result.export = 'data';
  if (obj[Object.keys(obj)[0]].constructor !== Object) {
    return result; // нет вложенных объектов - просто данные
  }
  for (const i in byType) {
    byType[i].forEach((e) => {
      registered.push(e);
    });
  }
  for (const key of Object.keys(obj)) {
    if (!registered.includes(key)) {
      notRegistered.push(key);
    }
  }
  if (notRegistered.length != 0) {
    if (Object.keys(byType).length != 0) {
      byType.notregistered = notRegistered;
    } else {
      byType.default = notRegistered;
    }
  }
  result.content = `let byTypes= ${JSON.stringify(byType, null, 2)}`;
  result.export += ', byTypes';
  return result;
}
function combineObjects(obj1, obj2) {
  for (const p in obj2) {
    try {
      if (ignoringHeaders.includes(p)) continue;
      if (obj2[p].constructor == Object) {
        obj1[p] = combineObjects(obj1[p], obj2[p]);
      } else {
        obj1[p] = obj2[p];
      }
    } catch (e) {
      obj1[p] = obj2[p];
    }
  }
  return obj1;
}
function renameKeys(obj, newKeys) {
  const keyValues = Object.keys(obj).map((key) => {
    const newKey = newKeys[key] || key;
    return {[newKey]: obj[key]};
  });
  return Object.assign({}, ...keyValues);
}
// глобально скрытые значения - не имеют важности
function isTrashHeader(str) {
  const trashHeaders = JSON.parse(fs.readFileSync(`${pathCSVs}modification/trashHeaders.json`, 'utf8').toLowerCase());
  const whiteList = ['WeaponFx'];

  if (whiteList.includes(str)) return false;
  str = str.toLowerCase();
  return (trashHeaders.includes(str) || str.startsWith('is') || str.includes('fx'));
}
// исправление порядка объекта
function fixOrder(obj) {
  const headers = JSON.parse(fs.readFileSync(`${pathCSVs}modification/headersOrder.json`, 'utf8'));
  let result = {};

  for (let i = 0; i < ObjectLength(obj); i++) {
    let objCopy = {...obj}; // сделать копию, чтобы не помять основной объект
    let path = null; // уровень 0
    let key = Object.keys(objCopy)[i];
    // определение глубины
    let depth = 0;
    while (typeof objCopy[key] === 'object' && objCopy[key].constructor.name == 'Object') {
      path = (path == null) ? key : `${path}.${key}`;
      key = Object.keys(objCopy[path])[depth];
      objCopy = objCopy[path];
      depth++;
    }
    // создание объекта с ключами (+индекс)
    const indexes = [];
    for (key in objCopy) {
      const elem = {};

      elem.index = (headers.includes(key)) ? headers.indexOf(key) : 666;
      elem.key = key;
      indexes.push(elem);
    }
    // сортировка по идексу
    const objSorted = indexes.slice(0);
    objSorted.sort((a, b) => a.index - b.index);
    // сборка готового массива и объекта
    const newKeys = [];
    for (const k of objSorted) {
      newKeys.push(k.key);
    }
    const result2 = {};
    for (key of newKeys) {
      result2[key] = objCopy[key];
    }
    if (path != null) {
      setToValue(result, result2, path);
    } else {
      result = result2;
    }
  }
  return result;
}
function setToValue(obj, value, path) {
  let i;
  path = path.split('.');
  for (i = 0; i < path.length - 1; i++) obj = obj[path[i]];

  obj[path[i]] = value;
}
function ObjectLength(object) {
  let length = 0;
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      ++length;
    }
  }
  return length;
}
// если не таблица, а просто данные в столбик
function simpleArray(array) {
  array.forEach((e, i, arr) => {
    if (e == '') {
      arr.splice(i, 1);
      return;
    }
    arr[i] = fixValue(null, null, e);
  });
  return {
    maxLevel: array.length,
    array,
  };
}
// из кучи объеков в один
function compileOne(obj) {
  const result = {};
  for (let name of Object.keys(obj)) {
    name = obj[name];
    for (let key in name) {
      const value = name[key];
      key = key.replace(/\s+/g, '');
      const stokValue = result[key];
      if (stokValue == undefined || stokValue === '') {
        result[key] = value;
      } else if (Array.isArray(stokValue)) {
        result[key].push(value);
      } else {
        result[key] = [];
        result[key].push(stokValue, value);
      }
    }
  }
  result.maxLevel = result.maxLevel.length;
  return result;
}
// заполнить пространство для соответствия уровню
function fillSpace(obj, spaceSymbol = 0, method = 'unshift') {
  for (const i of Object.keys(obj)) {
    if (ignoringHeaders.includes(i) || !Array.isArray(obj[i])) continue;
    while (obj[i].length < obj.maxLevel) {
      obj[i][method](spaceSymbol);
    }
  }
  return obj;
}
function pushArrays(obj, newName, key1, key2) {
  obj[newName] = [];
  for (let i = 0; i < obj.maxLevel; i++) {
    obj[newName].push(`${obj[key1][i]}!${obj[key2][i]}`);
  }
  [key1, key2].forEach((e) => delete obj[e]);
  return obj;
}
