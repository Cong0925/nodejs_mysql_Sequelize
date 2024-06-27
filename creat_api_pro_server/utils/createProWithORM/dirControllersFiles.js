// 生成 api_1_0/controllers 目录下的所有文件
const fs = require('fs');
const createFile = require('../createFile');
const path = require('path');
const { DataDefaultVal } = require('../../config/index');

const dirConfigFiles = (data, ws) => {
  const { thePath, theContData } = data;

  // 生成 表名 对应的 控制器文件
  createTableControllers(data, ws)

  // 生成 视图 对应的 控制器文件
  // createViewControllers(data, ws)
}

// 生成 表名 对应的 控制器文件 
const createTableControllers = (data, ws) => {
  const { thePath, theContData } = data;

  // 单纯只有表名 ['table1','table2','table3','table4']
  let selectedTables = theContData.selectedTables // 数组
  let tables = theContData.tables // 对象

  selectedTables.forEach((item, index) => {
    let t1 = item.charAt(0).toUpperCase() + item.slice(1) // 将表名首字母大写

    // 业务主键字段
    let primaryKey = tables[item].primaryKeyField === '' ? tables[item].fields.filter((itm) => {
      return itm.Key !== ''
    })[0].Field : tables[item].primaryKeyField

    // 加密字段
    let encipherField = tables[item].encryptField // 数组
    // 逻辑删除字段
    let logicDelField = tables[item].logicDelField
    // 所有不为空字段
    let allMustFields = tables[item].fields.reduce((arr, cur) => {
      if (cur.Null === 'NO' && cur.Key === '') {
        arr.push(`'${cur.Field}'`)
      }
      return arr;
    }, [])

    let createFun_s1 = `
  let allMustFields = [${allMustFields}]
  allMustFields.forEach((item)=>{
    if (!Object.keys(req.body).includes(item)){
      responseHandler.handleStatus200(res, { code: RET.PARAMERR, message: \`\${error_map_CN[RET.PARAMERR]}, 缺少\${item}参数\` });
      return;
    }
  })`
    let allFields = tables[item].fields
    let createFun_s2 = '';
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
        if (itm.Default !== null) {
          return itm.Default
        }
        if (itm.Default === null) {
          if (/^varchar\(\d+\)$/.test(itm.Type)) {
            return DataDefaultVal['varchar']
          } 
          return DataDefaultVal[itm.Type]
        }
      }
      console.log(defaultValue)
      createFun_s2 +=
        ` ${itm.Field}: req.body.${itm.Field} || ${defaultValue(itm)},\n`
    })

    const createFun =
      `
// 添加数据
const create = async (req, res) => {
  // 不为空参数 校验
  ${createFun_s1}

  // 创建对象
  const ${item}_obj = {
    ${createFun_s2}
  }

  // 如果需要传递主键, 查询是否存在 当前数据
  if (req.body.${primaryKey}) {
    try {
      const data = await ${t1}.findByPk(req.body.${primaryKey});
      if (data) {
        responseHandler.handleStatus200(res, { code: RET.ERROR, message: \`\${error_map_CN[RET.ERROR]}, 主键冲突\` });
        return;
      }

      // 调用模型方法
      const createdData = await  ${t1}.create(${item}_obj);
      responseHandler.handleStatus200(res, { code: RET.OK, data: createdData, message: error_map_CN[RET.OK] });
    } catch (err) {
      logger.error(err);
      responseHandler.handleStatus200(res, { code: RET.ERROR, message: \`\${error_map_CN[RET.ERROR]}, \${err.message} \` });
    }
  } else {
    try {
      // 调用模型方法
      const createdData = await ${t1}.create(${item}_obj);
      responseHandler.handleStatus200(res, { code: RET.OK, data: createdData, message: error_map_CN[RET.OK] });

    } catch (err) {
      logger.error(err);
      responseHandler.handleStatus200(res, { code: RET.ERROR, message: \`\${error_map_CN[RET.ERROR]}, \${err.message} \` });
    }
  }
};\n`

    const findAllFun =
      `
// 查询所有数据
const findAll = async (req, res) => {
  // 设置默认的分页参数
  const page = parseInt(req.query.Page, 10) || 1;
  const size = parseInt(req.query.Size, 10) || 10;
  const pageSize = Math.max(size, 1);
  const offset = (page - 1) * pageSize;

  // 构建查询条件
  const where = {
    ...req.query,
    ${logicDelField}: 0
  };
  delete where?.Page
  delete where?.Size

  try {
    // 调用模型方法 查询数据
    const data = await ${t1}.findAndCountAll({
      where: where,
      offset: offset,
      limit: pageSize
    });

    // 未查询到数据
    if (data.rows.length === 0) {
      responseHandler.handleStatus200(res, { code: RET.NODATA, message: error_map_CN[RET.NODATA] });
      return;
    }

    // 返回数据
    const paginatedData = {
      code: RET.OK,
      totalCount: data.count,
      data: data.rows,
      currentPage: page,
      currentCount: data.rows.length,
      message: error_map_CN[RET.OK]
    };
    responseHandler.handleStatus200(res, paginatedData);

  } catch (err) {
    // 查询失败
    logger.error(err);
    responseHandler.handleStatus200(res, { code: RET.ERROR, message: \`\${error_map_CN[RET.ERROR]}, \${err.message}\` });
  }
};\n`

    const findOneFun =
      `
// 查询单条数据
const findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const data = await ${t1}.findByPk(id);
    // 未找到数据
    if (data === null) {
      responseHandler.handleStatus200(res, { code: RET.NODATA, message: error_map_CN[RET.NODATA] });
      return
    }
    // 找到数据 , 已经逻辑删除
    if (data.dataValues.${logicDelField} === 1) {
      responseHandler.handleStatus200(res, { code: RET.NODATA, message: error_map_CN[RET.NODATA] + ',或数据已被删除' });
      return
    }
    // 找到数据，返回
    responseHandler.handleStatus200(res, { code: RET.OK, data: data.dataValues, message: error_map_CN[RET.OK] });

  } catch (err) {
    // 查询失败
    logger.error(err);
    responseHandler.handleStatus200(res, { code: RET.ERROR, message: \`\${error_map_CN[RET.ERROR]}, \${err.message}\` });
  }
};\n`

    const updateFun =
      `
// 修改数据
const update = async (req, res) => {
  const id = req.params.id; // 获取要修改数据 的 id
  const updateData = req.body; // 获取要修改的数据

  const attributes = ${t1}.attributes; // 获取模型字段

  // 处理字段不合法的情况
  for (const field in updateData) {
    if (!attributes.hasOwnProperty(field)) {
      responseHandler.handleStatus200(res, { code: RET.PARAMERR, message: \`\${error_map_CN[RET.PARAMERR]} ,无效参数 \${field} \` });
      return;
    }
  }

  try {
    const findByPkRes = await ${t1}.findByPk(id);
    // 未找到数据 或者数据被 删除
    if (findByPkRes === null || findByPkRes.dataValues.${logicDelField} === 1) {
      responseHandler.handleStatus200(res, { code: RET.DATAERR, message: error_map_CN[RET.DATAERR] + ',该条数据不存在' });
      return
    }
    const updateRes = await ${t1}.update(req.body, { where: { ${primaryKey}: id } });
    // updateRes 是个数组, [0]代表没有修改数据 或者 [1]有一条数据被修改 ,当前这两种情况均视为成功
    responseHandler.handleStatus200(res, { code: RET.OK, data: { ...findByPkRes.dataValues, ...req.body }, message: error_map_CN[RET.OK] });

  } catch (err) {
    // 查询失败
    logger.error(err);
    responseHandler.handleStatus200(res, { code: RET.ERROR, message: \`\${error_map_CN[RET.ERROR]}, \${err.message}\` });
  }
};\n`

    const deleteOneFun =
      `
// 删除单条数据
const deleteOne = async (req, res) => {
  const id = req.params.id;
  // 先看模型是否有逻辑删除字段,如果有则逻辑删除,否则删除,  这一步在代码生成器中判断, 目前不考虑物理删除

  try {
    const findByPkRes = await ${t1}.findByPk(id);
    if (findByPkRes === null || findByPkRes.dataValues.${logicDelField} === 1) {
      responseHandler.handleStatus200(res, { code: RET.DATAERR, message: error_map_CN[RET.DATAERR] + ',该条数据不存在' });
      return
    }
    const updateRes = await ${t1}.update({ ${logicDelField}: 1 }, { where: { ${primaryKey}: id } });
    responseHandler.handleStatus200(res, { code: RET.OK, data: { ...findByPkRes.dataValues, is_delete: 1 }, message: error_map_CN[RET.OK] })
  } catch (err) {
    // 查询失败
    logger.error(err);
    responseHandler.handleStatus200(res, { code: RET.ERROR, message: \`\${error_map_CN[RET.ERROR]}, \${err.message}\` });
  }

  // 物理删除 数据，根据需要自行设定
  // try{
  //   const findByPkRes = await ${t1}.findByPk(id);
  //   if (findByPkRes === null || findByPkRes.dataValues.${logicDelField} === 1) {
  //     responseHandler.handleStatus200(res, { code: RET.DATAERR, message: error_map_CN[RET.DATAERR] + ',该条数据不存在' });
  //     return
  //   }
  //   const destroyRes = await ${t1}.destroy({ where: { ${primaryKey}: id } });
  //   responseHandler.handleStatus200(res, { code: RET.OK, data: {...findByPkRes.dataValues,is_delete: 1}, message: error_map_CN[RET.OK] })
  // }catch (err){
  //   // 查询失败
  //   responseHandler.handleStatus200(res, { code: RET.ERROR, message: \`\${error_map_CN[RET.ERROR]}, \${err.message}\` });
  // }
};\n`

    const deleteAllFun =
      `
// 删除所有数据
const deleteAll = async (req, res) => {
  responseHandler.handleStatus200(res, { code: RET.USERERR, message: \`\${error_map_CN[RET.USERERR]}, 暂不支持\` });

  // 物理删除 数据，根据需要自行设定
  // try{
  //   const destroyRes = await Admin.destroy({ where: {}, truncate: false });
  //   responseHandler.handleStatus200(res, { code: RET.OK, data: destroyRes, message: error_map_CN[RET.OK] });

  // }catch (err){
  //   // 查询失败
  //   responseHandler.handleStatus200(res, { code: RET.ERROR, message: \`\${error_map_CN[RET.ERROR]}, \${err.message}\` });
  // }
};\n`

    let CONTENT = `// 导入 db实例
const db = require("../models");
// 导入操作符对象
const Op = db.Sequelize.Op;
// 导入 主键生成方法
const { generateBusinessKey1, generateBusinessKey2 } = require('../utils/createPrimaryKey');
// 导入响应处理方法
const responseHandler = require('../utils/responseHandler.js');
// 导入模型
const ${t1} = db.${item};

${createFun}
${findAllFun}
${findOneFun}
${updateFun}
${deleteOneFun}
${deleteAllFun}

module.exports = { create, findAll, findOne, update, deleteOne, deleteAll }`

    let params = {
      thePath: path.join(thePath, `/${item}.controller.js`),
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
    let t1 = item.charAt(0).toUpperCase() + item.slice(1) // 将表名首字母大写

    // 业务主键字段
    let primaryKey = tables[item].primaryKeyField === '' ? tables[item].fields.filter((itm) => {
      return itm.Key !== ''
    })[0].Field : tables[item].primaryKeyField

    // 加密字段
    let encipherField = tables[item].encryptField // 数组


    const findAllFun =
      `
// 查询所有数据
const findAll = async (req, res) => {
  // 设置默认的分页参数
  const page = parseInt(req.query.Page, 10) || 1;
  const size = parseInt(req.query.Size, 10) || 10;
  const pageSize = Math.max(size, 1);
  const offset = (page - 1) * pageSize;

  // 构建查询条件
  const where = {
    ...req.query,
    ${logicDelField}: 0
  };
  delete where?.Page
  delete where?.Size

  try {
    // 调用模型方法 查询数据
    const data = await ${t1}.findAndCountAll({
      where: where,
      offset: offset,
      limit: pageSize
    });

    // 未查询到数据
    if (data.rows.length === 0) {
      responseHandler.handleStatus200(res, { code: RET.NODATA, message: error_map_CN[RET.NODATA] });
      return;
    }

    // 返回数据
    const paginatedData = {
      code: RET.OK,
      totalCount: data.count,
      data: data.rows,
      currentPage: page,
      currentCount: data.rows.length,
      message: error_map_CN[RET.OK]
    };
    responseHandler.handleStatus200(res, paginatedData);

  } catch (err) {
    // 查询失败
    logger.error(err);
    responseHandler.handleStatus200(res, { code: RET.ERROR, message: \`\${error_map_CN[RET.ERROR]}, \${err.message}\` });
  }
};\n`

    const findOneFun =
      `
// 查询单条数据
const findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const data = await ${t1}.findByPk(id);
    // 未找到数据
    if (data === null) {
      responseHandler.handleStatus200(res, { code: RET.NODATA, message: error_map_CN[RET.NODATA] });
      return
    }
    // 找到数据 , 已经逻辑删除
    if (data.dataValues.${logicDelField} === 1) {
      responseHandler.handleStatus200(res, { code: RET.NODATA, message: error_map_CN[RET.NODATA] + ',或数据已被删除' });
      return
    }
    // 找到数据，返回
    responseHandler.handleStatus200(res, { code: RET.OK, data: data.dataValues, message: error_map_CN[RET.OK] });

  } catch (err) {
    // 查询失败
    logger.error(err);
    responseHandler.handleStatus200(res, { code: RET.ERROR, message: \`\${error_map_CN[RET.ERROR]}, \${err.message}\` });
  }
};\n`

      let CONTENT = 
      `// 导入 db实例
const db = require("../models");
// 导入响应处理方法
const responseHandler = require('../utils/responseHandler.js');
// 导入模型
const ${t1} = db.${item};

${findAllFun}
${findOneFun}

module.exports = { findAll, findOne }`

    let params = {
      thePath: path.join(thePath, `/${item}.controller.js`),
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
