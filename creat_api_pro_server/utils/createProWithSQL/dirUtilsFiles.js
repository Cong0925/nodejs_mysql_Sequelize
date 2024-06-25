// 生成 api_1_0/utils/ 内部工具函数
const fs = require('fs');
const createFile = require('../createFile');
const path = require('path');

const dirConfigFiles = (data, ws) => {
  const { thePath, theContData } = data;

  createResponseHandler(data, ws)
  createGetRsaKey(data, ws)
  createEncryptData(data, ws)
  createPrimaryKey(data, ws)
}

// 生成 responseHandler.js
const createResponseHandler = (data, ws) => {
  const { thePath, theContData } = data;

  const CONTENT = `// responseHandler.js 
  module.exports = { 
    /** 
     * 处理服务器错误 
     * @param {Object} res - 服务器响应对象 
     */ 
    handleServerError(res) { 
      // 这里可以添加一些日志记录或错误处理逻辑 
      const response = { 
        code: '500', 
        message: '服务器内部错误', 
      }; 
      res.status(500).json(response); 
    },  
    /** 
     * 处理未找到资源的情况 
     * @param {Object} res - 服务器响应对象 
     * @param {string} message - 错误消息 
     */ 
    handleNotFound(res, message) { 
      // 这里可以添加一些日志记录或错误处理逻辑 
      const response = { 
        code: '404', 
        message: message, 
      }; 
      res.status(404).json(response); 
    },  
    /** 
     * 处理成功的操作 
     * @param {Object} res - 服务器响应对象 
     * @param {Object|Array} data - 返回给客户端的数据 
     * @param {string} message - 成功消息 
     */ 
    handleSuccess(res, data, message) { 
      // 这里可以添加一些日志记录或成功处理逻辑  
      // 初始化totalCount 
      let totalCount = 0; 
      // 检查data是否为数组 
      if (Array.isArray(data)) { 
        totalCount = data.length; // 数组的长度就是总数 
      } else if (data && typeof data === 'object') { 
        // 如果data是对象，您可以根据对象中的某个属性来设置totalCount 
        totalCount = Object.keys(data).length; // 对象的键的数量就是总数 
      }  
      const response = { 
        code: '2000', 
        data: data, 
        totalCount: totalCount, 
        message: message, 
      }; 
      res.status(200).json(response); 
    },
    /** 
 * 参数错误
 * @param {Object} res - 服务器响应对象 
 * @param {string} message - 成功消息 
 */
  handleParamsErr(res, message) {
    const response = {
      code: '2001',
      message: message,
    };
    res.status(200).json(response);
  }
};`

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

// 生成 getRsaKey.js
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

// 生成 encryptData.js
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
// let aa = encrypt(str) 加密，这一步一般客户端做
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

// 生成 createPrimaryKey.js
const createPrimaryKey = (data, ws) => {
  const { thePath, theContData } = data;

  let CONTENT = `// createPrimaryKey.js
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

module.exports = dirConfigFiles;
