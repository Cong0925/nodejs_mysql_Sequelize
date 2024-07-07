// 生成 api_1_0/utils/ 内部工具函数
const fs = require('fs');
const createFile = require('../createFile');
const path = require('path');

const dirLoadersFiles = (data, ws) => {
  const { thePath, theContData } = data;
  let theFiles = ['express', 'global', 'index', 'intercept', 'logger', 'multer', 'routes',];
  createExpressFile(data,ws)
  createGlobalFile(data,ws)
  createIndexFile(data,ws)
  createInterceptFile(data,ws)
  createLoggerFile(data,ws)
  createMulterFile(data,ws)
  createRoutesFile(data,ws)
}


// 生成 express.js
const createExpressFile = (data, ws) => {
  const { thePath, theContData } = data;
  let CONTENT =
    `// express.js
const cors = require("cors");// 导入cors中间件 允许跨域
const express = require("express");//导入express
const bodyParser = require('body-parser');// 导入body-parser中间件 解析post请求的body数据

const expressLoader = async (app) => {

  // 配置解析 application/x-www-form-urlencoded 格式的表单数据的中间件
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });
  // 配置解析 application/json 格式的请求体数据的中间件
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // 将cors注册为全局中间件
  app.use(cors()); //不传参默认允许简单跨域和预检跨域
  // 配置解析 application/x-www-form-urlencoded 格式的表单数据的中间件
  app.use(express.urlencoded({ extended: false }));

  return app
}
module.exports = { expressLoader }
  `

  const params = {
    thePath: path.join(thePath, 'express.js'),
    data: CONTENT
  }

  createFile(params, ws).then((res) => {
    console.log(res)
  }).catch((err) => {
    console.log(err)
  })
}
//  生成 global.js
const createGlobalFile = (data, ws) => {
  const { thePath, theContData } = data;

  let CONTENT = `// global.js 
// 引入配置文件
const CONFIG = require('../config/index') 
// 引入自定义的响应码 全局注册
const { RET, error_map_CN, error_map_EN } = require('../utils/responseCode');

const globalLoader = () => {
  
  global.RET = RET;
  global.error_map_CN = error_map_CN;
  global.error_map_EN = error_map_EN;
}

module.exports = { globalLoader }
  `

  const params = {
    thePath: path.join(thePath, 'global.js'),
    data: CONTENT
  }

  createFile(params, ws).then((res) => {
    console.log(res)
  }).catch((err) => {
    console.log(err)
  })
}
//  生成 index.js
const createIndexFile = (data, ws) => {
  const { thePath, theContData } = data;
  let CONTENT =
  `// index.js 
const { expressLoader } = require('./express') // express模块
const { interceptLoader } = require('./intercept')  // 路由拦截 模块
const { routesLoader } = require('./routes') //  routes 路由模块
const { multerLoader } = require('./multer')  // multer 模块
const { globalLoader } = require('./global')  // global 全局注册
const { loggerLoader } = require('./logger')  // logger 日志模块

const init = async (expressApp) => {
  // 注意引入顺序，顺序错误，可能导致报错
  await globalLoader()
  console.log('globalLoader Intialized'); // 全局引入，这个顺序暂时无影响
  
  await expressLoader(expressApp);
  console.log('expressLoader Intialized');  // 初始化express，建议放前面

  await multerLoader(expressApp);
  console.log('multerLoader Intialized'); // 初始化multer，建议放前面，它会影响req.body的读取

  await interceptLoader(expressApp)
  console.log('routesLoader Intialized'); // 路由拦截，建议放 路由模块之前

  await routesLoader(expressApp)
  console.log('routesLoader Intialized'); // 路由模块，建议放最后

  await loggerLoader()
  console.log('loggerLoader Intialized'); // 日志模块，建议放最后
  // ... more loaders can be here
}

module.exports = { init }
  `

  const params = {
    thePath: path.join(thePath, 'index.js'),
    data: CONTENT
  }

  createFile(params, ws).then((res) => {
    console.log(res)
  }).catch((err) => {
    console.log(err)
  })
}
//  生成 intercept.js
const createInterceptFile = (data, ws) => {
  const { thePath, theContData } = data;

  let CONTENT = `// intercept.js
const responseHandler = require('../utils/responseHandler'); // 导入响应处理方法
const jwt = require('jsonwebtoken');
const CONFIG = require('../config/index'); // 导入配置文件

const interceptLoader = (app) => {
  app.use((req, res, next) => {
    // 提取 req.path 的路径部分，去除前面的 '/api'
    const path = req.path.replace('/api/', '');
    // console.log(CONFIG.routesWhitelist, path);
    // 检查请求的路由是否在白名单中
    if (CONFIG.routesWhitelist.includes(path)) {
      next();
      return;
    }

    // 验证token
    if (req.headers.token) {
      // 提取实际的 token 值
      jwt.verify(req.headers.token, CONFIG.publicKeyPem, { algorithms: ['RS256'] }, (err, decoded) => {
        if (err) {
          console.log('过期，或者错误', err);
          responseHandler.handleStatus200(res, { code: RET.SESSIONERR, message: \`\${error_map_CN[RET.SESSIONERR]}, 或者 token过期\` });
          return
        }
        req.user_id = decoded.user_id; // 从解码后的 Token 中获取用户 ID 并存储在 req 对象中
        next();
      });
    } else {
      console.log('token不存在');
      responseHandler.handleStatus200(res, { code: RET.SESSIONERR, message: error_map_CN[RET.SESSIONERR] });
    }
  });
}

module.exports = {
  interceptLoader,
}
  `

  const params = {
    thePath: path.join(thePath, 'intercept.js'),
    data: CONTENT
  }

  createFile(params, ws).then((res) => {
    console.log(res)
  }).catch((err) => {
    console.log(err)
  })
}
//  生成 logger.js
const createLoggerFile = (data, ws) => {
  const { thePath, theContData } = data;

  let CONTENT = `// logger.js
const log4js = require('../config/logs.config') // 日志生成库导入
const loggerLoader = async () => {

  // 引入log4js配置，初始化全局对象
  const logger = log4js.getLogger('default'); // 使用默认类别
  
  // 赋值给全局对象【logger】，也可以直接替换【console】
  global.logger = logger 
  // global.console = logger
}

module.exports = { loggerLoader }
  `
  const params = {
    thePath: path.join(thePath, 'logger.js'),
    data: CONTENT
  }

  createFile(params, ws).then((res) => {
    console.log(res)
  }).catch((err) => {
    console.log(err)
  })
}
//  生成 multer.js
const createMulterFile = (data, ws) => {
  const { thePath, theContData } = data;
  let CONTENT =
    `// multer.js 
const multer = require('multer');// 导入multer中间件 用于处理文件上传 或者 form-data格式的请求数据
const multerLoader = async (app) => {
 
  // 文件上传中间件 设置
  const storage = multer.diskStorage({
    // 设置上传文件的存储路径
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    // 设置上传文件的文件名
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now())
    }
  })
  app.use(multer({ storage: storage }).array('formData', 12));

  return app
}

module.exports = { multerLoader }
  `

  const params = {
    thePath: path.join(thePath, 'multer.js'),
    data: CONTENT
  }

  createFile(params, ws).then((res) => {
    console.log(res)
  }).catch((err) => {
    console.log(err)
  })
}
//  生成 routes.js
const createRoutesFile = (data, ws) => {
  const { thePath, theContData } = data;
  let CONTENT =
    `// routes.js 
const routes = require('../routes');  // 引入 routes/index.js 文件

const routesLoader = async (app) => {
  
  // 使用挂载的路由
  app.use('/api', routes);
  return app
}

module.exports = { routesLoader }
  `

  const params = {
    thePath: path.join(thePath, 'routes.js'),
    data: CONTENT
  }

  createFile(params, ws).then((res) => {
    console.log(res)
  }).catch((err) => {
    console.log(err)
  })
}

module.exports = dirLoadersFiles;
