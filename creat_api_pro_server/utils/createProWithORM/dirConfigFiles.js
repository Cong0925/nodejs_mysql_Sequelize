// 生成 api_1_0/config 目录下的所有文件
const fs = require('fs');
const createFile = require('../createFile');
const path = require('path');

const dirConfigFiles = (data, ws) => {
  const { thePath, theContData } = data;
  // let theFiles = ['db.config.js','index.js','logs.config.js'] 给自己看的，config 目录下 有哪些配置文件
  createDbConfigFile(data, ws)
  createIndexFile(data, ws)
  createLogsConfigFile(data, ws)
}

// 创建 db.config.js
const createDbConfigFile = (data, ws) => {
  const { thePath, theContData } = data;

  let CONTENT =
    `// db.config.js
module.exports = {
  HOST: "${theContData.host}", // 连接的数据库地址
  USER: "${theContData.user}", // 连接的数据库用户名
  PASSWORD: "${theContData.password}", // 连接的数据库密码
  DB: "${theContData.database}", // 连接的数据库名
  port:${theContData.port}, // 连接的数据库端口
  dialect: "mysql", // 连接的数据库类型
  timezone: "+08:00", // 时区
  pool: {
    max: 5, // 连接池中最大连接数
    min: 0, // 连接池中最小连接数
    acquire: 30000, // 获取连接最大等待时间
    idle: 10000 // 连接闲置时间
  }
};
`

  const params = {
    thePath: path.join(thePath, 'db.config.js'),
    data: CONTENT
  }

  createFile(params, ws).then((res) => {
    console.log(res)
  }).catch((err) => {
    console.log(err)
  })
}

// 创建 index.js
const createIndexFile = (data, ws) => {
  const { thePath, theContData } = data;

  const CONTENT = `const CONFIG = {
  token_expire_time: 7 * 24 * 60 * 60 * 1000, // 一个星期
  routesWhitelist: ['login', 'regist'],
  port: 8888,
  publicKeyPem: \`-----BEGIN RSA PUBLIC KEY-----
MIIBCgKCAQEA5KmFvTPK1ZRrUwnS7M3Kb+/cxOOaGdNo67v8AzEvPOM7S8mrkCou
D4TiewYBDBjUGfggRTlkUUSsVqkkXb4Z6YTn816RUf8phZ7E/lGqnrTZY9To0cEW
ZRMFgmaBa+OBVjDE60bM+ArCvve8G8nVDY8Xi+rSu+KqnFyqVlWsG0bXl26UKE/a
2K9SBKR8p90ey9e8I6ObaVQ/ETHWHHH0s40YzYJBG3/JgKzvPzFd86EhhRmxyXvz
24Yc+soF3e2UCyLnNEHVCbTlUuGfMD/rdPiSJL+o3gpl7GBADULABiwdzL9rhTYi
wp7rl+E8uUJE+p6uxBHoV4/S66fArdBN5wIDAQAB
-----END RSA PUBLIC KEY-----
\`,
    privateKeyPem: \`-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA5KmFvTPK1ZRrUwnS7M3Kb+/cxOOaGdNo67v8AzEvPOM7S8mr
kCouD4TiewYBDBjUGfggRTlkUUSsVqkkXb4Z6YTn816RUf8phZ7E/lGqnrTZY9To
0cEWZRMFgmaBa+OBVjDE60bM+ArCvve8G8nVDY8Xi+rSu+KqnFyqVlWsG0bXl26U
KE/a2K9SBKR8p90ey9e8I6ObaVQ/ETHWHHH0s40YzYJBG3/JgKzvPzFd86EhhRmx
yXvz24Yc+soF3e2UCyLnNEHVCbTlUuGfMD/rdPiSJL+o3gpl7GBADULABiwdzL9r
hTYiwp7rl+E8uUJE+p6uxBHoV4/S66fArdBN5wIDAQABAoIBAEGhgJ/yLi1IWNew
MajDVm/zhkfC1hfEjNBgl/BonRjaVcome8Y4vRi6OPE7o3BP7gz4IXcNBoSm89o5
2RTI/BIBEjxRr987oDTYgc1HLnQ4D09urFaMF7vyDjpD5rDLT3OoMtUe8LTfDc+X
Npg5QZwPLqB7yXmhEPwpQsDd/TSkgVba7PoQS6Jjitk4WhwXZveHhMeK2DZkSgvs
+VUmr2mRLP/smjtPEOYs15MIYJ42XVQHE05MGOuqh1KwYzXF9mWg0SF+frXr1jkS
I9ExhOvmO7lm/hyPswRESEr/3p0Ur+W4QSUclMnHO7HRl/eOqgEW85qtr/TSqnQh
eaxfdtkCgYEA9B7RoX/pqI8HF4e216QqUSKzaFkTRBDNN6AiVLhpiDYx5bTvWc0y
YXcJYJxlc1D5eA5hkYxX36ArshQXtYjLOLv/ADEh7hJI4jvjw9nm2gWCTymQ19dY
A7QID1dJgTcSKJg1InfTTkTH2voifmdu0oB1gH05sut2qfvoXWWCdEkCgYEA78oh
QQ/TvGg/q731S58qXj3HApb+/TbWWjfP8Gop6K3TMyKtbRnt5IUNedQt0hbtYCvz
TU0lnSqPUwi5WesPXoUNEa4ox5IZYWlBcVQ4Y+xXA0KRcZwahZrknkbE0gCaAJq5
dRuZF5g/twSS7kpw6gTVq7TIx9NROFvXZcLsUK8CgYEA6fdbnLg2Xilud5vHnpcl
Q4vJfNnaQCMGPCjKnn38DuM6IVivCVdD0OvAXgqmpMXXwrutwUxLr/UXy9279216
sA5l0G5GgaCen80cd0mxGgWrpWlF+8fU//+cte9HcIMycRun2TgUmfALx5ByXMmP
Ckq50wKxuQw5N6NKSbEPPZkCgYA1SZICR2YiZHhhziEI4SIlN01Wgf/AfcM84VJQ
dwdBMf/RSU+JA04ejoLkJAbavUWbLakv8Ij/WEnphfLKzLXpp1+0IiPl1c3WG/Hz
IWg2rHrZup1fxfUO49ESa1+p24BdygSUxcFLwQXHwjh0xA47sz9YnSBRZ+CQybgg
YSTq+QKBgQDg1cvY+YPj1zgfOcHzlHwgcs+Xgqxcp+6VdV5gi+PQuUthn1I81+pc
FcjhfXn6KBN5Xye1jCJcd1BRIH3JDfEcJcdX7H5iX5SfcoubGDImCfW9bIxdMQwF
bblP1/oKIjpAxnvgCGGRh0+8kbXLOFxtvZL5dwiHqe0NW0NpLXtM6w==
-----END RSA PRIVATE KEY-----
\`,
}
module.exports = CONFIG`

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

// 创建 logs.config.js
const createLogsConfigFile = (data, ws) => {
  const { thePath, theContData } = data

  const CONTENT =
    `// logs.config.js
const log4js = require('log4js');
log4js.configure({
  appenders: {
    // 文件输出
    fileAppender: {
      type: 'dateFile',
      filename: './logs/default',  // 日志文件的存储名
      alwaysIncludePattern: true,  // （可选，默认false）将模式包含在当前日志文件的名称以及备份中
      pattern: "yyyy-MM-dd.log",
      encoding: 'utf-8', // （可选，默认为utf-8）文件数据的存储编码
      maxLogSize: 1024 * 1024 * 1 // 文件最大存储空间 1M
    }
  },
  categories: {
    // 设置默认只记录 warn 及以上级别日志
    default: {
      appenders: ['fileAppender'], // consoleAppender 添加后可以在控制台打印
      level: 'warn'
    }
  }
});

module.exports = log4js;
  `

  const params = {
    thePath: path.join(thePath, 'logs.config.js'),
    data: CONTENT
  }

  createFile(params, ws).then((res) => {
    console.log(res)
  }).catch((err) => {
    console.log(err)
  })
}
module.exports = dirConfigFiles;
