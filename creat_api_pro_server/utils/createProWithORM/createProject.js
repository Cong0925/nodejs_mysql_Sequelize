const fs = require('fs');
const path = require('path');
const createFile = require('../createFile')
const dirConfigFiles = require('./dirConfigFiles') // 创建 config 文件夹下的文件
const dirControllersFiles = require('./dirControllersFiles') // 创建 controllers 文件夹下的文件
const dirModelsFiles = require('./dirModelsFiles') // 创建 models 文件夹下的文件
const dirRoutesFiles = require('./dirRoutesFiles') // 创建 routes 文件夹下的文件
const dirUtilsFiles = require('./dirUtilsFiles') // 创建 Utils 文件夹下的文件

const createProject = async (ws) => {

  let configs = {
    projectName: '',
    subfolders: ['config', 'controllers', 'logs', 'models', 'routes', 'utils'],
  }
  let fillPath = path.join(__dirname, '../../config/configs.json');
  // console.log('fillPath', fillPath)
  // 读取config.json文件内容
  await fs.readFile(fillPath, 'utf8', (err, data) => {
    if (err) {
      let msg = '读取配置文件时出错：' + err
      console.error(msg);
      ws.send(JSON.stringify({ results: msg, code: '2003', type: 'creating' }));
      return;
    }

    // 解析JSON数据
    const config = JSON.parse(data);
    configs.projectName = config.projectName;

    // 获取projectName值
    const targetPath = path.join(__dirname, '../../dist/orm/' + configs.projectName);

    // 定义要创建的目录的路径
    fs.mkdir(targetPath, { recursive: true }, (err) => {
      // 判断是否创建成功
      if (err) {
        let msg = `Error creating folder ${config.projectName}:` + err
        console.error(msg);
        ws.send(JSON.stringify({ results: msg, code: '2003', type: 'creating' }));
        return;
      }
      // 创建成功后
      let msg = `Folder ${config.projectName} created successfully!`
      console.error(msg);
      ws.send(JSON.stringify({ results: msg, code: '2000', type: 'creating' }));

      // 创建app.js文件 接口启动文件
      createAppJS(targetPath, ws)

      // 创建package.json文件 接口 依赖文件
      createPackageJson(targetPath, ws)

      // 创建使用说明文件
      createInstructionMd(targetPath, ws)

      // 在 项目中创建子文件夹和 对应文件
      configs.subfolders.forEach((subfolder) => {
        // 获取 子文件夹的路径
        const subfolderPath = path.join(targetPath, subfolder);
        // 创建 子文件夹
        fs.mkdir(subfolderPath, { recursive: true }, (err) => {
          // 判断是否创建成功
          if (err) {
            let msg = `Error creating folder ${subfolderPath}:` + err
            console.error(msg);
            ws.send(JSON.stringify({ results: msg, code: '2003', type: 'creating' }));
            return;
          }
          // 创建成功后
          let msg = `Folder ${subfolderPath} created successfully!`
          ws.send(JSON.stringify({ results: msg, code: '2000', type: 'creating' }));
          console.error(msg);

          // // 在每个子文件夹中创建 文件
          let params = {
            thePath: subfolderPath,
            theContData: config
          }
          switch (subfolderPath.substring(subfolderPath.lastIndexOf("\\") + 1)) {
            case 'config':
              let configParams = {
                thePath: subfolderPath,
                theContData: {
                  host: config.host,
                  user: config.user,
                  port: config.port,
                  password: config.password,
                  database: config.database,
                }
              }
              dirConfigFiles(configParams, ws)
              break;
            case 'controllers':
              dirControllersFiles(params, ws)
              break;
            case 'logs':
              break;
            case 'models':
              dirModelsFiles(params, ws)
              break;
            case 'routes':
              dirRoutesFiles(params, ws)
              break;
            case 'utils':
              dirUtilsFiles(params, ws)
              break;
            default:
              console.log('项目，不存在该子文件夹！');
          }
        });
      });
    });
  })
}

// 生成 项目启动文件 app.js
const createAppJS = (targetPath, ws) => {
  let CONTENT =
    `// app.js
const express = require("express");//导入express
const multer = require('multer');// 导入multer中间件 用于处理文件上传 或者 form-data格式的请求数据
const cors = require("cors");// 导入cors中间件 允许跨域

const bodyParser = require('body-parser');// 导入body-parser中间件 解析post请求的body数据
const routes = require('./routes');  // 引入 index.js 文件
const CONFIG = require('./config/index') // 引入配置文件
// 引入自定义的响应码 全局注册
const { RET, error_map_CN, error_map_EN } = require('./utils/responseCode');
global.RET = RET;
global.error_map_CN = error_map_CN;
global.error_map_EN = error_map_EN;

const log4js = require('./config/logs.config') // 日志生成库导入

// 引入log4js配置，初始化全局对象
const logger = log4js.getLogger('default'); // 使用默认类别
global.logger = logger // 赋值给全局对象【logger】，也可以直接替换【console】
// global.console = logger

// 创建express服务器实例
const app = express();
const port = CONFIG.port;

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

// 使用挂载的路由
app.use('/api', routes);

// 启动服务器
app.listen(port, () => {
  console.log("api server running at 127.0.0.1:" + port);
});

// 捕获未抓捕的异常，例如进程突然挂掉时的报错
process.on('uncaughtException', function (err) {
  logger.error(err.stack) // 保存错误的调用栈
})
  `

  let params = {
    thePath: path.join(targetPath, 'app.js'),
    data: CONTENT
  }

  createFile(params, ws).then((res) => {
    console.log(res)
  }).catch((err) => {
    console.log(err)
  })
}

// 生成 项目配置文件 package.json
const createPackageJson = (targetPath, ws) => {

  let CONTENT =
    `{
  "name": "model_pro_api",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \\\"Error: no test specified\\\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.19.2",
    "express-jwt": "^8.4.1",
    "log4js": "^6.9.1",
    "multer": "^1.4.5-lts.1",
    "mysql2": "^3.10.1",
    "sequelize": "^6.37.3"
  }
}
  `

  let params = {
    thePath: path.join(targetPath, 'package.json'),
    data: CONTENT
  }

  createFile(params, ws).then((res) => {
    console.log(res)
  }).catch((err) => {
    console.log(err)
  })
}

// 生成 使用说明文件 使用说明.md
const createInstructionMd = (targetPath, ws) => {

  let CONTENT =
    `
使用说明
进入项目目录
先 npm i 安装依赖包
然后 node ./app.js 启动项目

注意事项
1. 每个表都要有 逻辑删除字段，类型为 tinyint 字段，0为未删除，1为已删除，不然会采用物理删除， 
  `

  let params = {
    thePath: path.join(targetPath, '使用说明.md'),
    data: CONTENT
  }

  createFile(params, ws).then((res) => {
    console.log(res)
  }).catch((err) => {
    console.log(err)
  })
}

module.exports = createProject;
