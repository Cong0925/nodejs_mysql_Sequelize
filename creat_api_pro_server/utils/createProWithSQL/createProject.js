const fs = require('fs');
const path = require('path');
const createFile = require('../createFile')
const dirConfigFiles = require('./dirConfigFiles') // 创建 config 文件夹下的文件
const dirRoutesFiles = require('./dirRoutesFiles') // 创建 routes 文件夹下的文件
const dirUtilsFiles = require('./dirUtilsFiles') // 创建 Utils 文件夹下的文件
const dirControllersFiles = require('./dirControllersFiles') // 创建 Controllers 文件夹下的文件
const dirModelsFiles = require('./dirModelsFiles') // 创建 Models 文件夹下的文件

const createProject = async (ws) => {

  let configs = {
    projectName: '',
    subfolders: ['config', 'controllers', 'models', 'routes', 'utils'],
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

    // 获取projectName值
    const targetPath = path.join(__dirname, '../../dist/' + config.projectName);

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
              console.log('操作类型错误！');
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
//导入express
const express = require("express");
// 导入multer中间件 用于处理文件上传 或者 form-data格式的请求数据
const multer  = require('multer');
// 导入cors中间件 允许跨域
const cors = require("cors");
// 导入body-parser中间件 解析post请求的body数据
const bodyParser = require('body-parser');
// 引入 index.js 文件
const routes = require('./routes'); 

// 创建express服务器实例
const app = express();
const port = 8888;

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
    "multer": "^1.4.5-lts.1",
    "mysql": "^2.18.1"
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
1. 每个表都要有 逻辑删除字段，不然生成的接口代码会报错 类型为 tinyint 字段，0为未删除，1为已删除
2. 如果表里有添加事件或者修改时间等字段，最好在设置默认值，或者要求调用创建/修改接口时必须传递相关参数，避免参数丢失
  2.1 已经建立好的表，没有设置默认值，可以先去修改一下 ALTER TABLE 你的表名 MODIFY 相关时间的字段 DATETIME DEFAULT CURRENT_TIMESTAMP;
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
