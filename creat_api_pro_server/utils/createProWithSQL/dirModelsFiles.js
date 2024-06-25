// 生成 api_1_0/models 目录下的所有文件
const fs = require('fs');
const createFile = require('../createFile');
const path = require('path');

const dirConfigFiles = (data, ws) => {
  const { thePath, theContData } = data;

  // 生成 表 模型文件
  createTableModels(data, ws)

  // 生成 视图 模型文件
  createViewModels(data, ws)

}

const createTableModels = (data, ws) => {
  const { thePath, theContData } = data;

  // 单纯只有表名 ['table1','table2','table3','table4']
  let selectedTables = theContData.selectedTables

  // tables 所有详细表结构
  let tables = theContData.tables

  selectedTables.forEach((item, index) => {
    let t1 = `${item}Model`
    let t = `getAll${item}s, get${item}byQuery, create${item}, update${item}, delete${item}`
    
    // 业务主键字段
    let primaryKey = tables[item].primaryKeyField === '' ? tables[item].fields.filter((item) => {
      return item.Key !== ''
    })[0].Field : tables[item].primaryKeyField

    // 业务主键字段生成规则
    let sentenceCreatePrimaryKey = ''
    if (tables[item].primaryKeyFieldRule === 'time_random_id' || tables[item].primaryKeyFieldRule === '') {
      sentenceCreatePrimaryKey = `if(!updateFields.includes('${primaryKey}')){
        bodyData.${primaryKey} = generateBusinessKey1()
      }`
    }
    if (tables[item].primaryKeyFieldRule === 'time_crypto_id') {
      sentenceCreatePrimaryKey = `if(!updateFields.includes('${primaryKey}')){
        bodyData.${primaryKey} = generateBusinessKey2()
      }`
    }

    // 加密字段
    let encryptFields = tables[item].encryptField

    // 逻辑删除字段
    let logicDelField = tables[item].logicDelField
    let logicDelFieldVal = tables[item].fields.filter((itm) => {
      return itm.Field !== logicDelField
    })[0].Type === 'tinyint' ? 1 : 1


    let getAllPart =
      `/**
* 获取所有 数据
* @param queryData 查询条件
* @param callback 回调函数，用于处理查询结果或错误
* @param callback.error 错误信息，如果查询出错，则返回错误信息
* @param callback.results 查询结果，如果查询成功，则返回用户信息数组
*/
const getAll${item}s = (queryData, callback) => {
  let conditions = Object.keys(queryData).map(key => \`\${key} = '\${queryData[key]}'\`).join(' AND ');

  const querySQL = \`SELECT * FROM ${item} \${conditions === '' ? '' : 'where' + conditions }\`;
  db.query(querySQL, (error, results, fields) => {
    if (error) {
      return callback(error, null);
    }
    callback(null, results);
  });
};
    `
    let getByQueryPart =
      `/**
* 根据 query 条件 获取 特定数据
*
* @param id 数据标识,业务主键
* @param callback 回调函数，接收两个参数，第一个为错误信息（如果有的话），第二个为查询到的用户信息（如果没有找到用户则返回null）
*/
const get${item}byQuery = (id, callback) => {
  const querySQL = 'SELECT * FROM ${item} WHERE ${primaryKey} = ?';
  db.query(querySQL, [id], (error, results, fields) => {
    if (error) {
      return callback(error, null);
    }
    if (results.length === 0) {
      callback(null, null); // 如果没有找到，返回 null
    } else {
      callback(null, results); // 返回查询到
    }
  });
};
    `
    let createPart =
      `/**
* 创建 数据
*
* @param bodyData 数据 内容
* @param callback 回调函数，参数为error和results
*/
const create${item} = (bodyData, callback) => {
  let updateFields = Object.keys(bodyData);
  ${sentenceCreatePrimaryKey}
  if(!updateFields.includes('${logicDelField}')){
    bodyData.${logicDelField} = 0
  }
  const querySQL = 'INSERT INTO ${item} SET ?';
  db.query(querySQL, bodyData, (error, results, fields) => {
    if (error) {
      return callback(error, null);
    }
    callback(null, results);
  });
};
    `
    let updatePart =
      `/**
* 更新 数据
* 
* @param id 业务主键
* @param bodyData 数据 内容
* @param callback 回调函数，包含两个参数：error和results
*/
const update${item} = (id, bodyData, callback) => {
  const querySQL = "UPDATE ${item} SET ? WHERE ${primaryKey} = ?";
  db.query(querySQL, [bodyData, id], (error, results, fields) => {
    if (error) {
      return callback(error, null);
    }
    callback(null, results);
  });
};
      `
    let deletePart =
      `/**
* 删除 数据
*
* @param id 业务主键
* @param callback 回调函数，用于处理删除结果
*/
const delete${item} = (id, callback) => {
  const querySQL = \`UPDATE ${item} SET ${logicDelField} = ${logicDelFieldVal} WHERE ${primaryKey} = ?\`;
  db.query(querySQL, [id], (error, results, fields) => {
    if (error) {
      return callback(error, null);
    }
    callback(null, results);
  });
};
      `

    let CONTENT = `// models/${item}Model.js` + '\n' +
      `const {generateBusinessKey1,generateBusinessKey2} = require('../utils/createPrimaryKey');` + '\n' +
      `const {encrypt,decrypt} = require('../utils/encryptData');` + '\n' +
      `const db = require('../config/db.js');` + '\n' + '\n' +
      `${getAllPart}` + '\n' + '\n' +
      `${getByQueryPart}` + '\n' + '\n' +
      `${createPart}` + '\n' + '\n' +
      `${updatePart}` + '\n' + '\n' +
      `${deletePart}` + '\n' + '\n' +
      `module.exports = {${t}}`

    let params = {
      thePath: path.join(thePath, `/${item}Model.js`),
      data: CONTENT
    }

    createFile(params, ws).then((res) => {
      console.log(res)
    }).catch((err) => {
      console.log(err)
    })

  })
}

const createViewModels = (data, ws) => {
  const { thePath, theContData } = data;

  // 单纯只有 视图名 ['view1','view2','view3','view4']
  let selectedViews = theContData.selectedViews

  // views 所有详细表结构
  let views = theContData.views


  selectedViews.forEach((item, index) => {
    let t1 = `${item}Model`
    let t = `getAll${item}s`

    // 视图查询的字段
    let toSearchFields = views[item].toSearchFields


    let getAllPart =
      `/**
* 获取所有 数据
* @param queryData 查询条件
* @param callback 回调函数，用于处理查询结果或错误
* @param callback.error 错误信息，如果查询出错，则返回错误信息
* @param callback.results 查询结果，如果查询成功，则返回用户信息数组
*/
const getAll${item}s = (queryData, callback) => {
  let toSearchFields = [${toSearchFields}]
  let conditions = Object.keys(queryData).map(key => \`\${key} = '\${queryData[key]}'\`).join(' AND ');
  const querySQL = \`SELECT * FROM ${item} \${conditions === '' ? '' : 'where' + conditions }\`;
  db.query(querySQL, (error, results, fields) => {
    if (error) {
      return callback(error, null);
    }
    callback(null, results);
  });
};
    `

    let CONTENT = `// models/${item}Model.js` + '\n' +
      `const {encrypt,decrypt} = require('../utils/encryptData');` + '\n' +
      `const db = require('../config/db.js');` + '\n' + '\n' +
      `${getAllPart}` + '\n' + '\n' +
      `module.exports = {${t}}`

    let params = {
      thePath: path.join(thePath, `/${item}Model.js`),
      data: CONTENT
    }

    createFile(params, ws).then((res) => {
      console.log(res)
    }).catch((err) => {
      console.log(err)
    })

  })
}

module.exports = dirConfigFiles;
