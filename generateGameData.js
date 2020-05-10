"use strict";
const fs = require("fs")
const prettier = require('prettier')

const pathCsvs = './rawData/csv/'
// let filesName = [
//   'ships',
//   'modules',
//   'red_star_sectors',
//   'stars',
//   'artifacts',
//   'spacebuildings',
//   'yellow_star_sectors',
//   'achievements',
//   'alliance_levels',
//   'cerb_groups',
//   'planet_levels',
//   'planets',
//   'player_goals',
//   'solar_system_gen_data',
//   'colonize_prices',
//   'blue_star_sectors',
//   'white_star_sectors',
//   'globals'
// ]
const filesName = ['ships']
const pathSave = './data/'
const modulesPath = './generateGameData.js_modules/'
const dataByTypes = require(`${pathCsvs}modification/byTypes.js`).default

global.ignoringHeaders = ['maxLevel', 'Name', 'TID', 'TID_Description', 'Icon', 'SlotType', 'Model']

module.exports = {
  combineObjects,
  renameKeys,
  isHide,
  compileOne,
  fillSpace,
  pushArrays
}

generateFiles(pathCsvs, filesName, pathSave)

// TODO сделать асинхронной
function generateFiles(pathCsvs, files, pathSave) {
  let modules = require(`${modulesPath}modules.js`).default
  let ships = require(`${modulesPath}ships.js`).default
  let solarSys = require(`${modulesPath}solarSystem.js`).default
  let planets = require(`${modulesPath}planets.js`).default
  let artifacts = require(`${modulesPath}artifacts.js`).default
  let spaceBuildings = require(`${modulesPath}spaceBuildings`).default
  let playerGoals = require(`${modulesPath}playerGoals`).default

  for (let file of files) {
    let json = CSVtoJSON(fs.readFileSync(`${pathCsvs}${file}.csv`, "utf8"))
    switch (file) {
      case 'modules':
        generateModules()
        break;
      case 'ships':
        generateShips()
        break;
      case 'yellow_star_sectors':
      case 'white_star_sectors':
      case 'blue_star_sectors':
        generateSolarSys(file)
        break;
      case 'planet_levels':
        generatePlanet_levels()
        break;
      case 'planets':
        generatePlanets()
        break;
      case 'planet_levels':
        json = compileOne(json)
        break;
      case 'artifacts':
        generateArtifacts()
        break;
      case 'solar_system_gen_data':
        generateSolar_system_gen_data()
        break;
      case 'spacebuildings':
        generateSpaceBuildings()
        break;
      case 'globals':
        generateGlobals()
        break;
      case 'player_goals':
        generatePlayer_goals()
        break;
      case 'alliance_levels':
        generateAlliance_levels()
        break;

      default:
        break;
    }
    saveToFile(`${pathSave}${file}Data.js`,
      fixOrder(json))

    function generateModules() {
      json = modules({
        rawData: json,
        shipsData: CSVtoJSON(fs.readFileSync(`${pathCsvs}ships.csv`, "utf8")),
        projectilesData: CSVtoJSON(fs.readFileSync(`${pathCsvs}projectiles.csv`, "utf8")),
        fixValue: require(`${pathCsvs}modification/fixValue.js`),
        dronesList: dataByTypes['ships']['drones']
      })
    }
    function generateShips() {
      json = ships({
        rawData: json,
        cerberusList: dataByTypes[file]['cerberus'],
        ship_spawners: CSVtoJSON(fs.readFileSync(`${pathCsvs}ship_spawners.csv`, "utf8")),
        GhostSpawnSecs: CSVtoJSON(fs.readFileSync(`${pathCsvs}solar_system_gen_data.csv`, "utf8"))['RedStar']['GhostSpawnSecs']
      })
    }
    function generateSolarSys(str) {
      json = solarSys({
        star: str.replace(/(.+?)_.*/, '$1'),
        rawData: json,
        scannersData: CSVtoJSON(fs.readFileSync(`${pathCsvs}spacebuildings.csv`, "utf8")).ShortRangeScanner,
        cerberusData: CSVtoJSON(fs.readFileSync(`${pathCsvs}cerb_groups.csv`, "utf8")),
      })
    }
    function generatePlanet_levels() {
      json = compileOne(json)
    }
    function generatePlanets() {
      json = planets({
        rawData: json,
        categories: dataByTypes[file]
      })
    }
    function generateArtifacts() {
      json = artifacts({
        rawData: json,
        artsByTypes: dataByTypes[file]['data'],
        blueprints: dataByTypes[file]['blueprints']
      })
    }
    function generateSolar_system_gen_data() {
      fillSpace(json.RedStar, ' ')
      pushArrays(json.RedStar, 'RegularInfuenceRange', 'RegularInfuenceRange_Min', 'RegularInfuenceRange_Max')
      pushArrays(json.RedStar, 'InfluenceAwardThreshold', 'InfluenceAwardThreshold_Min', 'InfluenceAwardThreshold_Max')
      delete json.RedStar.GhostSpawnSecs // лучше пусть будет в ships
    }
    function generateSpaceBuildings() {
      json = spaceBuildings({
        rawData: json
      })
    }
    function generateGlobals() {
      for (let i of Object.keys(json)) {
        json[i] = json[i]['Value']
      }
    }
    function generatePlayer_goals() {
      json = playerGoals({
        rawData: json,
        needFix: dataByTypes[file]['all']
      })
    }
    function generateAlliance_levels() {
      json = compileOne(json)
      json.Name = 'alliance_levels'
    }
  }
}

function saveToFile(file, jsonObj) {
  let name = file.replace(/.*\/(.*)Data\.js/, '$1')
  let addData = addContent(jsonObj, name)

  const content = `
// generated by ${__filename}
// at ${new Date().toDateString()}

let data = ${JSON.stringify(jsonObj, null, 2)}

${addData['content'] || ""}

export {${addData['export']}}
`
  fs.writeFileSync(
    file,
    prettier.format(content, {
      parser: 'babel',
      trailingComma: 'es5',
      printWidth: 410, // чтоб массивы выстраивались в одну линию
    })
  )
  console.log(`Файл ${file} создан`)
}

// парсер из таблицы в обектJS
function CSVtoJSON(csv) {
  let data = csv.split('\n');
  let headers = data[0].split(',')
  let jsonObj = {}
  let name = null

  if (headers.length == 1) return simpleArray(data)
  for (let i = 1; i < data.length; i++) {
    let string = data[i].split(',')

    if (string == "") continue
    if (string[0] !== "") {
      name = string[0]
      jsonObj[name] = {}
      jsonObj[name]['maxLevel'] = 1
    } else {
      jsonObj[name]['maxLevel']++
    }
    for (let j = 0; j < string.length; j++) {
      let header = headers[j].trim()
      let value = string[j].trim()
      let stokValue = jsonObj[name][header]

      if (isTrashHeader(header) || value === undefined || value === "") continue
      value = fixValue(name, header, value)
      if (value == null) continue
      if (stokValue == undefined || stokValue === "") {
        jsonObj[name][header] = value
      } else {
        if (Array.isArray(stokValue)) {
          jsonObj[name][header].push(value)
        } else {
          jsonObj[name][header] = []
          jsonObj[name][header].push(stokValue, value)
        }
      }
    }
  }
  return removeDupsFromArrays(jsonObj)
}

// скрыть/исправить значения для красоты результата
function fixValue(name, header, value) {
  if (ignoringHeaders.includes(header)) {
    return value
  }
  let fixValue = require(`${pathCsvs}modification/fixValue.js`).fixValue
  if (isHide(name, header)) return null
  for (let i in fixValue) {
    if (fixValue[i]['header'].includes(header)) {
      return fixValue[i]['func'](value)
    }
  }
  if (value >= 0) {
    return parseInt(value)
  }
  return value
}
function isHide(name, header, strict = false) { // скрывает невалидные данные: "0", " " или просто ненужные,  strict - скрыть валидные данные (2я проверка)
  let path = (strict) ? 'hide2' : 'hide'
  let hide = require(`${pathCsvs}modification/fixValue.js`)[path]
  for (let i in hide) {
    if (hide[i]['name'].includes(name)) {
      if (hide[i]['headers'].includes(header)) {
        return true
      }
    }
  }
  return false
}
// массив, сравнивать i и i+1, если все элементы равны установить вместо массива i[0] || {key:[1,1,1,1]} => {key:1}
function removeDupsFromArrays(obj) {
  let names = Object.keys(obj)
  for (let name of names) {
    let headlers = Object.keys(obj[name])
    for (let headler of headlers) {
      let item = obj[name][headler]
      if (!Array.isArray(item)) continue
      let isBreak = false
      for (let i = 0; i < item.length; i++) {
        if (item[i] !== item[i + 1] && item[i + 1] !== undefined) {
          isBreak = true // пока хз как лучше
          break
        }
      }
      if (!isBreak) {
        obj[name][headler] = item[0]
      }
    }
  }
  return obj
}
// добавить захардкоженый контент
function addContent(obj, needData) {
  let byType = dataByTypes[needData] || {}
  let result = {}
  let registered = []
  let notRegistered = []

  result['export'] = 'data'
  if (obj[Object.keys(obj)[0]].constructor !== Object) {
    return result // нет вложенных объектов - просто данные 
  }
  for (let i in byType) {
    byType[i].forEach(e => {
      registered.push(e)
    });
  }
  for (let key of Object.keys(obj)) {
    if (!registered.includes(key)) {
      notRegistered.push(key)
    }
  }
  if (notRegistered.length != 0) {
    if (Object.keys(byType).length != 0) {
      byType['notregistered'] = notRegistered
    } else {
      byType['default'] = notRegistered
    }
  }
  result['content'] = 'let byTypes= ' + JSON.stringify(byType, null, 2)
  result['export'] += ', byTypes'
  return result
}

function combineObjects(obj1, obj2) {
  for (var p in obj2) {
    try {
      if (ignoringHeaders.includes(p)) continue
      if (obj2[p].constructor == Object) {
        obj1[p] = combineObjects(obj1[p], obj2[p])
      } else {
        obj1[p] = obj2[p]
      }
    } catch (e) {
      obj1[p] = obj2[p]
    }
  }
  return obj1
}

function renameKeys(obj, newKeys) {
  const keyValues = Object.keys(obj).map(key => {
    const newKey = newKeys[key] || key
    return { [newKey]: obj[key] }
  })
  return Object.assign({}, ...keyValues)
}

// глобально скрытые значения - не имеют важности
function isTrashHeader(str) {
  let trashHeaders = JSON.parse(fs.readFileSync(`${pathCsvs}modification/trashHeaders.json`, "utf8").toLowerCase())
  str = str.toLowerCase()
  return (trashHeaders.includes(str) || str.startsWith('is') || str.includes('fx'))
}

// исправление порядка объекта
function fixOrder(obj) {
  let headers = JSON.parse(fs.readFileSync(`${pathCsvs}modification/headersOrder.json`, "utf8"));
  let result = {}

  for (let i = 0; i < ObjectLength(obj); i++) {
    let objCopy = Object.assign({}, obj); // сделать копию, чтобы не помять основной объект
    let path = null // уровень 0
    let key = Object.keys(objCopy)[i]
    //определение глубины 
    let depth = 0
    while (typeof objCopy[key] === 'object' && objCopy[key].constructor.name == 'Object') {
      path = (path == null) ? key : path + '.' + key
      key = Object.keys(objCopy[path])[depth]
      objCopy = objCopy[path]
      depth++
    }
    // создание объекта с ключами (+индекс)
    let objKeys = Object.keys(objCopy)
    let indexes = [];
    for (key in objCopy) {
      let elem = {}
      let index = (headers.includes(key)) ? headers.indexOf(key) : 666
      elem['index'] = index
      elem['key'] = key
      indexes.push(elem)
    }
    // сортировка по идексу
    let objSorted = indexes.slice(0);
    objSorted.sort(function (a, b) {
      return a.index - b.index;
    });
    // сборка готового массива и объекта 
    let newKeys = []
    for (let k of objSorted) {
      newKeys.push(k.key)
    }
    let result2 = {}
    for (key of newKeys) {
      result2[key] = objCopy[key]
    }
    if (path != null) {
      setToValue(result, result2, path)
    } else {
      result = result2
    }
  }
  return result
}
function setToValue(obj, value, path) {
  var i;
  path = path.split('.');
  for (i = 0; i < path.length - 1; i++)
    obj = obj[path[i]];

  obj[path[i]] = value;
}
function ObjectLength(object) {
  let length = 0
  for (let key in object) {
    if (object.hasOwnProperty(key)) {
      ++length
    }
  }
  return length
}
// если не таблица, а просто данные в столбик
function simpleArray(array) {
  array.forEach((e, i, arr) => {
    if (e == '') {
      arr.splice(i, 1)
      return
    }
    arr[i] = fixValue(null, null, e)
  });
  return {
    maxLevel: array.length,
    array: array
  }
}
// из кучи объеков в один
function compileOne(obj) {
  let result = {}
  for (let name of Object.keys(obj)) {
    name = obj[name]
    for (let key in name) {
      let value = name[key]
      key = key.replace(/\s+/g, '')
      let stokValue = result[key]
      if (stokValue == undefined || stokValue === "") {
        result[key] = value
      } else {
        if (Array.isArray(stokValue)) {
          result[key].push(value)
        } else {
          result[key] = []
          result[key].push(stokValue, value)
        }
      }
    }
  }
  result['maxLevel'] = result['maxLevel'].length
  return result
}
// заполнить пространство для соответствия уровню 
function fillSpace(obj, spaceSymbol = 0, method = 'unshift') {
  for (let i of Object.keys(obj)) {
    if (ignoringHeaders.includes(i) || !Array.isArray(obj[i])) continue
    while (obj[i].length < obj.maxLevel) {
      obj[i][method](spaceSymbol)
    }
  }
  return obj
}
// объединить однотипные массивы, нужен рефакторинг для адекватного форматирования
function pushArrays(obj, newName, key1, key2, symbol = '-') {
  obj[newName] = []
  for (let i = 0; i < obj.maxLevel; i++) {
    obj[newName].push(obj[key1][i] + symbol + obj[key2][i])
  }
  [key1, key2].forEach(e => delete obj[e]);
  return obj
}