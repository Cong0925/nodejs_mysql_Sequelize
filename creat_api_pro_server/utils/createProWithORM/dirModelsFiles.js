// 生成 api_1_0/models 目录下的所有文件
const fs = require('fs');
const createFile = require('../createFile');
const path = require('path');

const { DataType, DataDefaultVal } = require('../../config/index');

const dirConfigFiles = (data, ws) => {
  const { thePath, theContData } = data;

  // 生成 index.js 文件
  createIndexFile(data, ws)

  // 生成 表 模型文件
  createTableModels(data, ws)

  // 生成 视图 模型文件
  createViewModels(data, ws)

  // 生成 user_token 模型文件
  createUserTokenModels(data, ws)

}

// 生成 index.js 文件
const createIndexFile = (data, ws) => {
  const { thePath, theContData } = data;

  // 单纯只有表名 ['table1','table2','table3','table4']
  let selectedTables = theContData.selectedTables
  // 单纯只有 视图名 ['view1','view2','view3','view4']
  let selectedViews = theContData.selectedViews
  let t1 = '// 表模型\n'
  let t2 = '// 视图模型\n'

  selectedTables.forEach((item, index) => {
    t1 += `db.${item} = require("./${item}.model.js")(sequelize, Sequelize); \n`
  })
  selectedViews.forEach((item, index) => {
    t2 += `db.${item} = require("./${item}.model.js")(sequelize, Sequelize); \n`
  })

  const CONTENT =
    `// 数据库连接 配置导入
  const dbConfig = require("../config/db.config.js");
  // 导入 Sequelize
  const Sequelize = require("sequelize");
  
  // 通过 Sequelize 连接数据库 Sequelize(数据库名称, 用户名, 密码, {配置项})
  const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST, // 数据库地址
    dialect: dbConfig.dialect, // 数据库类型
    operatorsAliases: false, // 操作符别名
  
    pool: {
      max: dbConfig.pool.max, // 连接池最大连接数
      min: dbConfig.pool.min, // 连接池最小连接数
      acquire: dbConfig.pool.acquire, // 获取连接的最大等待时间，毫秒
      idle: dbConfig.pool.idle // 如果连接池中没有可用连接，最大等待时间
    }
  });
  
  const db = {};
  
  db.Sequelize = Sequelize;
  db.sequelize = sequelize;
  
  // 导入模型
  ${t1}

  ${t2}
  db.user_token = require("./user_token.model.js")(sequelize, Sequelize); 
  
  module.exports = db;
  `

  let params = {
    thePath: path.join(thePath, `/index.js`),
    data: CONTENT
  }

  createFile(params, ws).then((res) => {
    console.log(res)
  }).catch((err) => {
    console.log(err)
  })

}

const createTableModels = (data, ws) => {
  const { thePath, theContData } = data;

  // 单纯只有表名 ['table1','table2','table3','table4']
  let selectedTables = theContData.selectedTables

  // tables 所有详细表结构
  let tables = theContData.tables

  selectedTables.forEach((item, index) => {
    let t1 = item.charAt(0).toUpperCase() + item.slice(1) // 将表名首字母大写

    let allFields = tables[item].fields

    let primaryKey = tables[item].primaryKeyField === '' ? tables[item].fields.filter((item) => {
      return item.Key !== ''
    })[0].Field : tables[item].primaryKeyField //业务主键字段

    // 加密字段
    let encryptFields = tables[item].encryptField

    // 逻辑删除字段
    let logicDelField = tables[item].logicDelField

    let t2 = ''

    allFields.forEach((itm) => {
      let defaultValue = (itm) => {
        if (itm.Field === primaryKey) {
          if (tables[item].primaryKeyFieldRule === 'time_random_id' || tables[item].primaryKeyFieldRule === '') {
            return `generateBusinessKey1()`
          }
          if (tables[item].primaryKeyFieldRule === 'time_crypto_id') {
            return `generateBusinessKey2()`
          }
          return `generateBusinessKey1()`
        }
        if (itm.Field === logicDelField) {
          return 0
        }
        if (itm.Default === 'CURRENT_TIMESTAMP') {
          return `Sequelize.NOW`
        }
        if (itm.Default === null) {
          if (/^varchar\(\d+\)$/.test(itm.Type)) {
            return DataDefaultVal['varchar']
          }
          return DataDefaultVal[itm.Type]
        }
        if (itm.Default !== null) {
          return itm.Default
        }
      }
      console.log(itm.Field, defaultValue(itm))


      t2 += `${itm.Field}:{
      type: Sequelize.${/^varchar\(\d+\)$/.test(itm.Type) ? DataType['varchar'] : DataType[itm.Type]},
      primaryKey: ${itm.Key === 'PRI' ? true : false},
      allowNull: ${itm.Null === 'YES' ? true : false},
      defaultValue: ${(defaultValue(itm))}
},\n  `})


    let CONTENT = `// 导入主键成成 函数
const {generateBusinessKey1,generateBusinessKey2} = require('../utils/createPrimaryKey');
// 导出模型实例
module.exports = (sequelize, Sequelize) => {
  const ${t1} = sequelize.define("${item}", {
    ${t2}
  }, {
    tableName: '${item}', // 指定表名
    timestamps: false, // 关闭自动添加时间戳
    freezeTableName: true, // 关闭自动将表名转换成复数形式 true关闭。false打开
  });

  return ${t1};
};
    `

    let params = {
      thePath: path.join(thePath, `/${item}.model.js`),
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
    let t1 = item.charAt(0).toUpperCase() + item.slice(1) // 将表名首字母大写

    let allFields = views[item].fields

    let t2 = ''

    allFields.forEach((itm) => {
      t2 += `${itm.Field}:{
  type: Sequelize.${DataType[itm.Type]},
},`})


    let CONTENT = `// 导入主键成成 函数
// 导出模型实例
module.exports = (sequelize, Sequelize) => {
  const ${t1} = sequelize.define("${item}", {
    ${t2}
  }, {
    freezeTableName: true, // 关闭自动将表名转换成复数形式 true关闭。false打开
  });

  return ${t1};
};
    `

    let params = {
      thePath: path.join(thePath, `/${item}.model.js`),
      data: CONTENT
    }

    createFile(params, ws).then((res) => {
      console.log(res)
    }).catch((err) => {
      console.log(err)
    })

  })
}

const createUserTokenModels = (data,ws)=>{
  const { thePath, theContData } = data;
  let CONTENT =
  ` // user_token.model.js
module.exports = (sequelize, Sequelize) => {
  // 定义 UserToken 模型
  const UserToken = sequelize.define('user_token', {
    auto_id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: Sequelize.BIGINT,
      primaryKey: false
    },
    token: {
      type: Sequelize.STRING(512),
      allowNull: false
    },
    user_type: {
      type: Sequelize.TINYINT,
      allowNull: false
    },
    is_valid: {
      type: Sequelize.TINYINT,
      primaryKey: false,
      allowNull: false,
      defaultValue: 0
    },
    is_delete: {
      type: Sequelize.TINYINT,
      primaryKey: false,
      allowNull: false,
      defaultValue: 0
    },
    expire_time: {
      type: Sequelize.DATE,
      primaryKey: false,
      allowNull: false,
      defaultValue: Sequelize.NOW
    },
    create_time: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    update_time: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
  }, {
    tableName: 'user_token', // 指定表名
    timestamps: false, // 关闭自动添加时间戳
    freezeTableName: true, // 关闭自动将表名转换成复数形式 true关闭。false打开
  });


  // 同步模型到数据库（创建表）
  sequelize.sync()
    .then(() => {
      console.log('UserToken 表已 同步！');
    })
    .catch((err) => {
      console.error('创建表时出错: ', err);
    });

  return UserToken;
}
  `
  let params = {
    thePath: path.join(thePath, `/user_token.model.js`),
    data: CONTENT
  }

  createFile(params, ws).then((res) => {
    console.log(res)
  }).catch((err) => {
    console.log(err)
  })

}

module.exports = dirConfigFiles;
