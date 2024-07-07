// 生成 api_1_0/utils/ 内部工具函数
const fs = require('fs');
const createFile = require('../createFile');
const path = require('path');

const dirConfigFiles = (data, ws) => {
  const { thePath, theContData } = data;
  let theFiles = [
    'createPrimaryKey', // 创建主键方法 文件
    'createToken', // 创建token 方法 文件
    'encryptData', // 加密数据方法 文件
    'getRsaKey', // 获取rsa密钥方法 文件
    'httpCode', // http状态码 文件
    'loggings', // 日志记录方法 文件
    'responseCode', // 响应状态码 文件
    'responseHandler', // 响应处理方法 文件
  ];
  createPrimaryKey(data, ws)
  createToken(data, ws)
  createEncryptData(data, ws)
  createGetRsaKey(data, ws)
  createHttpCode(data, ws)
  createLoggings(data, ws)
  createResponseCode(data, ws)
  createResponseHandler(data, ws)
}

//  生成 createPrimaryKey.js
const createPrimaryKey = (data, ws) => {
  const { thePath, theContData } = data;

  let CONTENT = `// createPrimaryKey.js 业务主键生成方法
  
// generateBusinessKey1.js
const crypto = require('crypto');
const process = require('process');

// 第一种方法：当前时间 + 进程ID + 随机数
function generateBusinessKey1() {
  // 获取时间 字符串 8位 20240625
  const timestamp = getTimeStr()
  // 获取进程ID并转换为字符串 5位
  const pid = process.pid.toString().padEnd(5, '0');
  // 将生成的随机整数格式化为四位数的字符串
  const randomNumber = (Math.floor(Math.random() * 9000) + 1000).toString();

  return \`\${timestamp}\${pid}\${randomNumber}\`.padEnd(12, '0'); // 拼接时间戳、进程ID和随机数，不足部分用0填充
}

// 第二种方法：当前时间 + 进程ID + crypto模块
function generateBusinessKey2() {
  // 获取时间 字符串 8位 20240625
  const timestamp = getTimeStr() 
  // 获取进程ID并转换为字符串 5位
  const pid = process.pid.toString().padEnd(5, '0'); 
  // 生成四个字符的随机数字符串
  const cryptoRandomString = generateRandomNumericString(4); // 4位 
  // 拼接时间戳、进程ID和crypto生成的随机数字符串  共17位
  return \`\${timestamp}\${pid}\${cryptoRandomString}\`;
}

// 生成日期格式
function getTimeStr() {
  let years = (new Date()).getFullYear()
  let months = ((new Date()).getMonth() + 1).toString().padStart(2, '0')
  let days = (new Date().getDate()).toString().padStart(2, '0')
  return '' + years + months + days
}

// 使用crypto模块生成随机数字字符串
function generateRandomNumericString(length) {
  // 生成指定长度的随机字节
  const randomBytes = crypto.randomBytes(length);
  // 将字节转换为十六进制字符串
  const hexString = randomBytes.toString('hex');
  // 过滤出所有数字字符
  const numericString = hexString.replace(/[^0-9]/g, '');

  // 确保结果字符串的长度符合要求
  if (numericString.length < length) {
    // 如果过滤后字符串的长度小于要求的长度，重新生成
    return generateRandomNumericString(length);
  } else {
    // 返回前四个数字字符
    return numericString.substring(0, length);
  }
}

module.exports = {
  generateBusinessKey1,
  generateBusinessKey2
};  
  `

  const params = {
    thePath: path.join(thePath, 'createPrimaryKey.js'),
    data: CONTENT
  }

  createFile(params, ws).then((res) => {
    console.log(res)
  }).catch((err) => {
    console.log(err)
  })
}
//  生成 createToken.js
const createToken = (data, ws) => {
  const { thePath, theContData } = data;
  let CONTENT = 
  `// createToken.js token生成文件
const jwt = require('jsonwebtoken');
const CONFIG = require('../config/index');

// 生成包含用户信息的 JWT Token
function generateToken(params, key = CONFIG.privateKeyPem, expire = CONFIG.token_expire_time) {
  const payload = {
    user_id: params,
  };

  const token = jwt.sign(payload, key, { algorithm: 'RS256',expiresIn: expire });
  return token;
}

module.exports = {
  generateToken,
}
  `

  const params = {
    thePath: path.join(thePath, 'createToken.js'),
    data: CONTENT
  }

  createFile(params, ws).then((res) => {
    console.log(res)
  }).catch((err) => {
    console.log(err)
  })
}
//  生成 encryptData.js
const createEncryptData = (data, ws) => {
  const { thePath, theContData } = data;

  let CONTENT = `// encryptData.js
const crypto = require('crypto');
const CONFIG = require('../config/index');

// 加密函数 服务端暂不使用，客户端加密后传给服务端
function encrypt(data) {
  const encryptBuffer = crypto.publicEncrypt(
    {
      key: CONFIG.publicKeyPem,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    Buffer.from(data, 'utf8')
  );
  return encryptBuffer.toString('base64');
}

// 解密函数
function decrypt(encryptedData) {
  const decryptBuffer = crypto.privateDecrypt(
    {
      key: CONFIG.privateKeyPem,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    Buffer.from(encryptedData, 'base64')
  );
  return decryptBuffer.toString();
}

module.exports = {
  encrypt,
  decrypt,
};

// 使用示例 XXXX.js内
// const crypto = require('crypto');
// const {encrypt,decrypt} = require('./encryptData'); 导入方法
// let str = '123456'
// let aa = encrypt(str) 加密，这一步一般客户端做，测试添加数据时可以手动加密
// console.log(aa)
// let bb = decrypt(aa) 解密
// console.log(bb)`

  const params = {
    thePath: path.join(thePath, 'encryptData.js'),
    data: CONTENT
  }

  createFile(params, ws).then((res) => {
    console.log(res)
  }).catch((err) => {
    console.log(err)
  })
}
//  生成 getRsaKey.js
const createGetRsaKey = (data, ws) => {
  const { thePath, theContData } = data;

  let CONTENT = `// getRsaKey.js
const crypto = require('crypto');
const fs = require('fs');

// 生成密钥对，此方法通过控制台自行调用,获取后更换 项目config的内容
const createKey = () => {
  // 生成 RSA 密钥对
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });

  let publicKeyPem = publicKey.export({ type: 'pkcs1', format: 'pem' })
  let privateKeyPem = privateKey.export({ type: 'pkcs1', format: 'pem' })

  // 保存公钥和私钥
  // 非常注意格式，只能是生成的这种形式，不要自己删除任何地方，要使用模板字符包裹，不然多行无法当作整体
  let CONFIG = \`{
    publicKeyPem: \`\${publicKeyPem}\`,
    privateKeyPem: \`\${privateKeyPem}\`,
  }\`
  fs.writeFile('key.js', CONFIG, (err) => {
    if (err) {
      console.error('文件 ' + ' 创建出错：', err);
    } else {
      console.log('文件 ' + ' 创建 成功');
    }
  });
}
createKey()
  `
  const params = {
    thePath: path.join(thePath, 'getRsaKey.js'),
    data: CONTENT
  }

  createFile(params, ws).then((res) => {
    console.log(res)
  }).catch((err) => {
    console.log(err)
  })
}
//  生成 httpCode.js
const createHttpCode = (data, ws) => {
  const { thePath, theContData } = data;
  let CONTENT = 
  `// httpCode.js http的状态码
const HttpStatus = {
  OK: 200, 
  Created: 201,
  Accepted: 202, 
  NoContent: 204,

  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  TemporaryRedirect: 307,

  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  Conflict: 409,
  Gone: 410,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  UnsupportedMediaType: 415,
  UnprocessableEntity: 425,
  PreconditionRequired: 428,

  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
}

module.exports = HttpStatus;
  `

  const params = {
    thePath: path.join(thePath, 'httpCode.js'),
    data: CONTENT
  }

  createFile(params, ws).then((res) => {
    console.log(res)
  }).catch((err) => {
    console.log(err)
  })
}
//  生成 loggings.js
const createLoggings = (data, ws) => {
  const { thePath, theContData } = data;
  let CONTENT = 
  `// loggings.js 日志操作定义
  `

  const params = {
    thePath: path.join(thePath, 'loggings.js'),
    data: CONTENT
  }

  createFile(params, ws).then((res) => {
    console.log(res)
  }).catch((err) => {
    console.log(err)
  })
}
//  生成 responseCode.js
const createResponseCode = (data, ws) => {
  const { thePath, theContData } = data;
  let CONTENT = 
  `// responseCode.js 接口状态码
// 定义错误码
const RET = {
  OK: "2000", // 操作成功
  NODATA: "2001", // 无数据
  DATAEXIST: "2002", // 数据已存在
  DATAERR: "2003", // 数据错误或缺失 
  ERROR: "2004", // 操作失败
  PARAMERR: "4000", // 参数错误 
  SESSIONERR: "4001", // 用户未登录
  LOGINERR: "4002", // 用户登录失败
  USERERR: "4003", // 用户不存在或未激活
  ROLEERR: "4004", // 用户身份错误
  PWDERR: "4005", // 密码错误
  REQERR: "4006", // 非法请求或请求次数受限
  IPERR: "4007", // IP受限
  URLNOTFOUND: "4008", // url未发现
  SIGNERR: "4009", // 签名失效
  INTERNALERR: "5000", // 内部错误
  DBERR: "5001", // 数据库查询错误
  THIRDERR: "5002", // 第三方系统错误
  IOERR: "5003", // 文件读写错误
  UNKOWNERR: "5004" // 未知错误
};

// 中文错误映射
const error_map_CN = {
  [RET.OK]: "操作成功",
  [RET.ERROR]: "操作失败",
  [RET.NODATA]: "无数据",
  [RET.DATAEXIST]: "数据已存在",
  [RET.DATAERR]: "数据错误",
  [RET.PARAMERR]: "数据错误或缺失",
  [RET.SESSIONERR]: "用户未登录",
  [RET.LOGINERR]: "用户登录失败",
  [RET.USERERR]: "用户不存在或未激活",
  [RET.ROLEERR]: "用户身份错误",
  [RET.PWDERR]: "密码错误",
  [RET.REQERR]: "非法请求或请求次数受限",
  [RET.IPERR]: "IP受限",
  [RET.DBERR]: "数据库查询错误",
  [RET.THIRDERR]: "第三方系统错误",
  [RET.IOERR]: "文件读写错误",
  [RET.UNKOWNERR]: "未知错误",
  [RET.SIGNERR]: "签名失效",
  [RET.URLNOTFOUND]: "url未发现"
};

// 英文错误映射
const error_map_EN = {
  [RET.OK]: "successfully!",
  [RET.NODATA]: "no data!",
  [RET.DATAEXIST]: "data exist!",
  [RET.DATAERR]: "data error!",
  [RET.PARAMERR]: "parameter error!",
  [RET.SESSIONERR]: "user not logged in!",
  [RET.LOGINERR]: "user login failed!",
  [RET.USERERR]: "user does not exist or not activation! ",
  [RET.ROLEERR]: "user role error!",
  [RET.PWDERR]: "password error!",
  [RET.REQERR]: "illegal request or limited number of requests",
  [RET.IPERR]: "IP restricted!",
  [RET.DBERR]: "database query error",
  [RET.THIRDERR]: "third party system error",
  [RET.IOERR]: "file read or write error!",
  [RET.UNKOWNERR]: "unknown error!",
  [RET.SIGNERR]: "sign invalidation",
  [RET.URLNOTFOUND]: "url not found"
};

module.exports = {
  RET,
  error_map_CN,
  error_map_EN
}
  `

  const params = {
    thePath: path.join(thePath, 'responseCode.js'),
    data: CONTENT
  }

  createFile(params, ws).then((res) => {
    console.log(res)
  }).catch((err) => {
    console.log(err)
  })
}
//  生成 responseHandler.js
const createResponseHandler = (data, ws) => {
  const { thePath, theContData } = data;

  const CONTENT = 
  `// responseHandler.js 
/** 
 *  200 OK：请求成功，服务器正常响应。
    400 Bad Request：请求有误，服务器无法理解。
    401 Unauthorized：请求需要用户身份验证。
    403 Forbidden：请求被服务器拒绝，无权访问。
    404 Not Found：请求的资源不存在。
    500 Internal Server Error：服务器内部发生错误。
    503 Service Unavailable：服务器暂时无法处理请求。
*/

// 服务器内部发生错误。
const handleStatus500 = (res, message)=> {
  // 这里可以添加一些日志记录或错误处理逻辑 
  logger.error('500 服务器内部发生错误: \\n' + message);
  const response = {
    code: '500',
    message: '服务器内部发生错误' + message,
  };
  res.status(500).json(response);
}

// 请求的资源不存在。
const handleStatus404=(res, message)=> {
  // 这里可以添加一些日志记录或错误处理逻辑 
  // logger.warn('400 请求资源不存在: \\n' + message)
  const response = {
    code: '404',
    message: message,
  };
  res.status(404).json(response);
}

// 请求被服务器拒绝，无权访问。
const handleStatus403=(res, message)=> {
  // 这里可以添加一些日志记录或成功处理逻辑 
  // logger.warn('403 请求被服务器拒绝，无权访问: \\n' + message)
  const response = {
    code: '403',
    message: message,
  };
  res.status(403).json(response);
}

// 请求需要用户身份验证。
const handleStatus401=(res, message)=> {
  // logger.warn('401 请求需要用户身份验证: \\n' + message)
  const response = {
    code: '401',
    message: message,
  };
  res.status(401).json(response);
}

// 请求有误，服务器无法理解。
const handleStatus400=(res, message)=> {
  // logger.error('400 请求有误，服务器无法理解: \\n' + message)
  const response = {
    code: '400',
    message: message,
  };
  res.status(400).json(response);
}

// 请求成功，服务器正常响应。
const handleStatus200=(res,data)=> {
  // logger.log('200 请求成功，服务器正常响应: \\n' + JSON.stringify(data, null, 2))
  const response = {
    ...data,
  };
  res.status(200).json(response);
}

module.exports = {
  handleStatus500,
  handleStatus404,
  handleStatus403,
  handleStatus401,
  handleStatus400,
  handleStatus200,
};
  `

  const params = {
    thePath: path.join(thePath, 'responseHandler.js'),
    data: CONTENT
  }

  createFile(params, ws).then((res) => {
    console.log(res)
  }).catch((err) => {
    console.log(err)
  })
}


module.exports = dirConfigFiles;
