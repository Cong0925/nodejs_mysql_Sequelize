// 生成 api_1_0/routes 目录下的所有文件
const fs = require('fs');
const createFile = require('../createFile');
const path = require('path');

const dirConfigFiles = (data, ws) => {
  const { thePath, theContData } = data;
  // 生成index.js文件
  creatIndex(data, ws)

  // 生成 表 的路由文件
  createTablesRoute(data, ws)

  // 生成 视图 的路由文件
  createViewsRoute(data, ws)
}

// 生成index.js文件
const creatIndex = (data, ws) => {
  const { thePath, theContData } = data;

  // 具体的所有表结构
  let tables = theContData.tables

  // 单纯只有表名 ['t1','t2','t3','t4']
  let selectedTables = theContData.selectedTables

  // 拼接成 ['t1Route','t2Route','t3Route','t4Route']
  let selectedTablesDeal = selectedTables.map((item, index) => {
    return `${item}Route`
  });

  // 第一处插入内容
  let sentenceRequire = ''
  // 第二处插入内容
  let sentenceUse = ''
  // 内容处理
  selectedTablesDeal.forEach((item, index) => {
    sentenceRequire += `const ${item} = require('./${item}');` + '\n'
    sentenceUse += `router.use('/', ${item});` + '\n'
  });
  // 生成内容
  const INDEXCONTENT = `// routes/index.js` + '\n' +
    `const express = require('express');` + '\n' +
    `const router = express.Router();` + '\n' + '\n' +
    `// 引入路由` + '\n' +
    `${sentenceRequire}` + '\n' + '\n' +
    `// 使用路由` + '\n' +
    `${sentenceUse}` + '\n' + '\n' +
    `// 导出路由` + '\n' +
    `module.exports = router;`

  const params = {
    thePath: path.join(thePath, '/index.js'),
    data: INDEXCONTENT
  }

  createFile(params, ws).then((res) => {
    console.log(res)
  }).catch((err) => {
    console.log(err)
  })
}

// 生成 表 的路由文件
const createTablesRoute = (data, ws) => {
  const { thePath, theContData } = data;

  // 单纯只有表名 ['t1','t2','t3','t4']
  let selectedTables = theContData.selectedTables

  // 拼接成 ['t1Route','t2Route','t3Route','t4Route']
  let selectedTablesDeal = selectedTables.map((item, index) => {
    return `${item}Route`
  });

  selectedTables.forEach((item, index) => {
    let t1 = `getAll${item}s,get${item}byQuery,create${item},update${item},delete${item}`
    let t2 = `${item}Controller`
    let t3 = `// 读取（查询）所有数据 或者 条件查询` + '\n' +
      `router.get('/${item}', getAll${item}s);` + '\n' + '\n' +
      `// 根据ID 特定数据` + '\n' +
      `router.get('/${item}/:id', get${item}byQuery);` + '\n' + '\n' +
      `// 创建（新增）数据` + '\n' +
      `router.post('/${item}', create${item});` + '\n' + '\n' +
      `// 更新（修改）数据` + '\n' +
      `router.put('/${item}/:id', update${item});` + '\n' + '\n' +
      `// 删除（删除）数据` + '\n' +
      `router.delete('/${item}/:id', delete${item});` + '\n'

    let CONTENT = `// routes/${selectedTablesDeal[index]}.js` + '\n' +
      `const express = require('express');` + '\n' +
      `const router = express.Router();` + '\n' + '\n' +
      `const {${t1}} = require('../controllers/${t2}');` + '\n' +
      `${t3}` + '\n' + '\n' +
      `module.exports = router;`

    let params = {
      thePath: path.join(thePath, `/${selectedTablesDeal[index]}.js`),
      data: CONTENT
    }

    createFile(params, ws).then((res) => {
      console.log(res)
    }).catch((err) => {
      console.log(err)
    })

  })
}

// 生成 视图 的路由文件
const createViewsRoute = (data, ws) => {
  const { thePath, theContData } = data;

  // 单纯只有 视图名 ['v1','v2','v3','v4']
  let selectedViews = theContData.selectedViews

  // 拼接成 ['v1Route','v2Route','v3Route','v4Route']
  let selectedViewsDeal = selectedViews.map((item, index) => {
    return `${item}Route`
  });

  selectedViews.forEach((item, index) => {
    let t1 = `getAll${item}s,get${item}byQuery`
    let t2 = `${item}Controller`
    let t3 = `// 读取（查询）所有数据 或者条件查询` + '\n' +
      `router.get('/${item}', getAll${item}s);` + '\n' + '\n' +
      `// 根据ID 获取 特定数据` + '\n' +
      `router.get('/${item}/:id', get${item}byQuery);` + '\n' 

      let CONTENT = `// routes/${selectedViewsDeal[index]}.js` + '\n' +
        `const express = require('express');` + '\n' +
        `const router = express.Router();` + '\n' + '\n' +
        `const {${t1}} = require('../controllers/${t2}');` + '\n' +
        `${t3}` + '\n' + '\n' +
        `module.exports = router;`

    let params = {
      thePath: path.join(thePath, `/${selectedViewsDeal[index]}.js`),
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
