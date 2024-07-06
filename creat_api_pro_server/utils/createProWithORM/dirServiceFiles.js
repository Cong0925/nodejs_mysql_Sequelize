// 生成 api_1_0/routes 目录下的所有文件
const fs = require('fs');
const createFile = require('../createFile');
const path = require('path');

const dirServiceFiles = (data, ws) => {
  const { thePath, theContData } = data;
  // 生成index.js文件
  creatIndex(data, ws)

  // 生成 用户 相关操作文件 登录，注册，修改密码等
  createUserCommon(data,ws)
}

// 生成index.js文件
const creatIndex = (data, ws) => {
  const { thePath, theContData } = data;
  
  // 生成内容
  const INDEXCONTENT = 
  ` // 自定义 接口模块
const express = require('express');
const router = express.Router();

// 导入方法
const UserCommon = require("./userCommonService.js");

// 路由
router.post('/login', UserCommon.login);
router.post('/regist', UserCommon.regist);

// 导出路由
module.exports = router;
  `

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

// userCommonService.js
const createUserCommon = (data, ws) => {
  const { thePath, theContData } = data;

  // 生成内容
  const INDEXCONTENT = 
  `// service/index.js
// 处理 用户登录，退出，注册 等业务逻辑
// 全局配置 导入
const CONFIG = require("../config/index.js");
// 导入 db实例
const db = require("../models/index.js");
// 导入操作符对象
const Op = db.Sequelize.Op;
// 导入 主键生成方法
const { generateBusinessKey1, generateBusinessKey2 } = require('../utils/createPrimaryKey.js');
// 导入响应处理方法
const responseHandler = require('../utils/responseHandler.js');
// 导入 token 生成方法
const { generateToken } = require('../utils/createToken.js');
// 导入 解密方法
const { decrypt } = require('../utils/encryptData.js');
// 导入模型 （这个根据自己数据库的用户表，自行更改）
const Sso_user = db.sso_user;
const User_token = db.user_token;

// 登录
const login = async (req, res) => {
  try {
    // 1. 判断用户是否存在
    // const user = await Sso_user.findOne({ where: { user_id: req.body.user_id,is_delete:0,state:1  } }); //手动输入, 根据id 判断当前id是否存在
    const user = await Sso_user.findOne({ where: { account: req.body.account, is_delete: 0, state: 1 } });
    if (!user) {
      responseHandler.handleStatus200(res, { code: RET.USERERR, message: error_map_CN[RET.USERERR] });
      return
    }
    // 2. 判断密码是否正确
    if (decrypt(user.password) !== decrypt(req.body.password)) {
      responseHandler.handleStatus200(res, { code: RET.PWDERR, message: error_map_CN[RET.PWDERR] });
      return
    }
    // 3.判断 token是否存在
    let token = await User_token.findOne({ where: { user_id: user.user_id } });
    let data = {
      user_id: user.user_id,
      token: token ? token.token : generateToken(user.user_id),
      user_type: user.role_type,
      expire_time: new Date(Date.now() + CONFIG.token_expire_time)
    }
    if (!token) {
      const createRes = await User_token.create(data)
      token = createRes;
    } else {
      const updateRes = await User_token.update(data, { where: { user_id: user.user_id } });
    }
    // 4. 返回用户信息
    responseHandler.handleStatus200(res, { code: RET.OK, token: token.token, data: { user_id: user.user_id, account: user.account, role_type: user.role_type }, message: error_map_CN[RET.OK] });
  } catch (err) {
    console.log(err);
    responseHandler.handleStatus200(res, { code: RET.UNKOWNERR, message: error_map_CN[RET.UNKOWNERR] });
  }
}

// 注册
const regist = async (req, res) => {
  // 用户id 后台自动生成 
  // 1.判断参数是否齐全
  if (!req.body.account || !req.body.password) {
    responseHandler.handleStatus200(res, { code: RET.PARAMERR, message: \`\${error_map_CN[RET.PARAMERR]}, account:\${req.body.account}, passwod:\${req.body.password}\` });
    return
  }
  // 2. 判断用户是否存在, 没有逻辑删除，则记为存在
  const user = await Sso_user.findOne({ where: { account: req.body.account, is_delete: 0 } });
  if (user) {
    return responseHandler.handleStatus200(res, { code: RET.DATAEXIST, data: user, message: error_map_CN[RET.DATAEXIST] });
  }
  // 3. 生成主键
  let primaryKeyField = generateBusinessKey1();
  let data = {
    ...req.body,
    user_id: primaryKeyField, // 放在后面，避免用户输入的id 对自动生成id 覆盖
  }
  // 4. 创建用户
  let createdData = await Sso_user.create(data);
  responseHandler.handleStatus200(res, { code: RET.OK, data: createdData, message: error_map_CN[RET.OK] });


  // // 用户id 用户注册时，自行输入
  // // 1.判断参数是否齐全
  // if (!req.body.account || !req.body.password || !req.body.user_id) {
  //     responseHandler.handleStatus200(res, { code: RET.PARAMERR,  message: \`\${error_map_CN[RET.PARAMERR]}, user_id:\${req.body.user_id}, account:\${req.body.account}, passwod:\${req.body.password}\` });
  //     return
  // }
  // // 2. 判断用户是否存在
  // const user = await Sso_user.findOne({ where: { user_id: req.body.user_id } });
  // if (user) {
  //     return responseHandler.handleStatus200(res, { code: RET.DATAEXIST, data: user, message: error_map_CN[RET.DATAEXIST] });
  // }
  // // 3. 创建用户
  // let data = {
  //     ...req.body
  // }
  // let createdData = await Sso_user.create(data);
  // responseHandler.handleStatus200(res, { code: RET.OK, data: createdData, message: error_map_CN[RET.OK] });
}

module.exports = { login, regist }
  `

  const params = {
    thePath: path.join(thePath, '/userCommonService.js'),
    data: INDEXCONTENT
  }

  createFile(params, ws).then((res) => {
    console.log(res)
  }).catch((err) => {
    console.log(err)
  })
}

module.exports = dirServiceFiles;
