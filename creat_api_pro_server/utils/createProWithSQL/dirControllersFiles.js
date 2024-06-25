// 生成 api_1_0/controllers 目录下的所有文件
const fs = require('fs');
const createFile = require('../createFile');
const path = require('path');

const dirConfigFiles = (data, ws) => {
  const { thePath, theContData } = data;

  // 生成 表名 对应的 控制器文件
  createTableControllers(data, ws)

  // 生成 视图 对应的 控制器文件
  createViewControllers(data, ws)
}

// 生成 表名 对应的 控制器文件 
const createTableControllers = (data, ws) => {
  const { thePath, theContData } = data;

  // 单纯只有表名 ['table1','table2','table3','table4']
  let selectedTables = theContData.selectedTables // 数组
  let tables = theContData.tables // 对象

  selectedTables.forEach((item, index) => {
    let t1 = `${item}Model`
    let t = `getAll${item}s, get${item}byQuery, create${item}, update${item}, delete${item}`

    // 业务主键字段
    let primaryKey = tables[item].primaryKeyField === '' ? tables[item].fields.filter((itm) => {
      return itm.Key !== ''
    })[0].Field : tables[item].primaryKeyField

    // 加密字段
    let encipherField = tables[item].encryptField // 数组

    // 所有不为空字段
    let allMustFields = tables[item].fields.reduce((arr, cur) => {
      if (cur.Null === 'NO' && cur.Key === '') {
        arr.push(`'${cur.Field}'`)
      }
      return arr;
    }, [])

    // getAllPart 插入
    let sentenct1 = 
    `
  let queryDataFields = Object.keys(queryData)
  queryDataFields.forEach((itm)=>{
    // 如果查询条件包含 加密字段 进行解密
    if(encipherField.includes(itm)){
      queryData.itm = decrypt(queryData.itm)
    }
  })
    `

    // createPart 插入
    let checkAllMustFieldsSentence =
      `// 查看是否传递所有必填字段
  let allMustFields = [${allMustFields}]
  let bodyDataFields = Object.keys(bodyData)
  allMustFields.forEach((item)=>{
    if(!bodyDataFields.includes(item)){
      responseHandler.handleParamsErr(res, \`缺少必填字段\${item} \`)
    }
  })
    `

    let getAllPart =
      `// 获取所有数据的控制器方法
const getAll${item}s = (req, res) => {
  const queryData = req.query
  ${sentenct1}
  ${t1}.getAll${item}s(queryData, (error, data) => {
    if (error) {
      console.error('Error fetching ${item}s:', error);
      responseHandler.handleServerError(res);
    } else {
      responseHandler.handleSuccess(res, data, 'Users fetched successfully');
    }
  });
};
    `
    let getByQueryPart =
      `// 根据 业务主键 条件 获取 特定数据的控制器方法
const get${item}byQuery = (req, res) => {
  const paramsData = req.params.id
  ${t1}.get${item}byQuery(paramsData, (error, data) => {
    if (error) {
      console.error('Error fetching ${item}s:', error);
      responseHandler.handleServerError(res);
    } else if (!data) {
      responseHandler.handleNotFound(res, 'Data not found');
    } else {
      responseHandler.handleSuccess(res, data, 'data fetched successfully');
    }
  });
};
    `
    let createPart =
      `// 创建新数据的控制器方法
const create${item} = (req, res) => {
  const bodyData = req.body;
  ${checkAllMustFieldsSentence}
  ${t1}.create${item}(bodyData, (error, data) => {
    if (error) {
      console.error('Error creating ${item}s:', error);
      responseHandler.handleServerError(res);
    } else {
      responseHandler.handleSuccess(res, data, 'data created successfully');
    }
  });
};
    `
    let updatePart =
      `// 更新数据的控制器方法
const update${item} = (req, res) => {
  const paramsData = req.params.id
  const bodyData = req.body
  ${t1}.update${item}(paramsData, bodyData, (error, data) => {
    if (error) {
      console.error('Error updating ${t1}s:', error);
      responseHandler.handleServerError(res);
    } else if (!data) {
      responseHandler.handleNotFound(res, 'data not found');
    } else {
      responseHandler.handleSuccess(res, data, 'data updated successfully');
    }
  });
};
      `
    let deletePart =
      `// 删除数据的控制器方法
const delete${item} = (req, res) => {
  const paramsData = req.params.id
  ${t1}.delete${item}(paramsData, (error, data) => {
    if (error) {
      console.error('Error deleting ${t1}s:', error);
      responseHandler.handleServerError(res);
    } else {
      responseHandler.handleSuccess(res, data, 'data deleted successfully');
    }
  });
};
      `

    let CONTENT = `// controller/${item}Controller.js` + '\n' +
      `const ${t1} = require('../models/${t1}.js');` + '\n' +
      `const {encrypt,decrypt} = require('../utils/encryptData');` + '\n' +
      `const responseHandler = require('../utils/responseHandler.js');` + '\n' + '\n' +
      `${getAllPart}` + '\n' + '\n' +
      `${getByQueryPart}` + '\n' + '\n' +
      `${createPart}` + '\n' + '\n' +
      `${updatePart}` + '\n' + '\n' +
      `${deletePart}` + '\n' + '\n' +
      `module.exports = {${t}}`

    let params = {
      thePath: path.join(thePath, `/${item}Controller.js`),
      data: CONTENT
    }

    createFile(params, ws).then((res) => {
      console.log(res)
    }).catch((err) => {
      console.log(err)
    })

  })
}

// 生成 视图 对应的 控制器文件
const createViewControllers = (data, ws) => {
  const { thePath, theContData } = data;

  // 单纯只有 视图名 ['view1','view2','view3','view4']
  let selectedViews = theContData.selectedViews

  selectedViews.forEach((item, index) => {
    let t1 = `${item}Model`
    let t = `getAll${item}s, get${item}byQuery`

    let getAllPart =
      `// 获取所有数据的控制器方法
const getAll${item}s = (req, res) => {
  const queryData = req.query
  ${t1}.getAll${item}s(queryData, (error, data) => {
    if (error) {
      console.error('Error fetching ${item}s:', error);
      responseHandler.handleServerError(res);
    } else {
      responseHandler.handleSuccess(res, data, 'Users fetched successfully');
    }
  });
};
    `
    let getByQueryPart =
      `// 根据 业务主键 条件 获取 特定数据的控制器方法
const get${item}byQuery = (req, res) => {
  const paramsData = req.params.id
  ${t1}.get${item}byQuery(paramsData, (error, data) => {
    if (error) {
      console.error('Error fetching ${item}s:', error);
      responseHandler.handleServerError(res);
    } else if (!data) {
      responseHandler.handleNotFound(res, 'Data not found');
    } else {
      responseHandler.handleSuccess(res, data, 'data fetched successfully');
    }
  });
};
    `

    let CONTENT = `// controller/${item}Controller.js` + '\n' +
      `const ${t1} = require('../models/${t1}.js');` + '\n' +
      `const responseHandler = require('../utils/responseHandler.js');` + '\n' + '\n' +
      `${getAllPart}` + '\n' + '\n' +
      `${getByQueryPart}` + '\n' + '\n' +
      `module.exports = {${t}}`

    let params = {
      thePath: path.join(thePath, `/${item}Controller.js`),
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
