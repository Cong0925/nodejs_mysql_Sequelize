const fs = require('fs');

const creatFile = (params, ws) => {

  const { thePath, data } = params;
  return new Promise((resolve, reject) => {
    fs.writeFile(thePath, data, (err) => {
      let msg = ''
      if (err) {
        reject(err); // 如果有错误，拒绝
        msg = '文件 ' + thePath + ' 创建出错：' + err
      } else {
        resolve('文件 ' + thePath + ' 创建 成功'); // 如果没有错误，解决
        msg = '文件 ' + thePath + ' 创建 成功'
      }
      ws.send(JSON.stringify({ results: msg, code: '2000', type: 'creating' }));
    });
  });
}

module.exports = creatFile;
