const fs = require('fs');
const path = require('path');
// const createProjectWithSQL = require('./utils/createProWithSQL/createProject')
const createProjectWithORM = require('./utils/createProWithORM/createProject')
const createFile = require('./utils/createFile')
// 数据库连接配置
const mysql = require('mysql');
const WebSocketServer = require('ws').Server;

// 创建WebSocket服务器的实例
const wss = new WebSocketServer({ port: 3000 });

// 数据库白名单，不进行返回
let tableWiteList = ['mysql', 'information_schema', 'performance_schema', 'sys', 'innodb'];

// 创建数据库连接的函数
const createConnection = (connectionInfo) => {
  const connection = mysql.createConnection({
    host: connectionInfo.host,
    port: connectionInfo.port,
    user: connectionInfo.user,
    password: connectionInfo.password,
    database: connectionInfo.database
  });

  connection.connect((err) => {
    if (err) {
      return null;
    }
    console.log('连接成功，连接ID ' + connection.threadId);
  });

  return connection;
};

// 监听WebSocket连接事件
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    try {
      const json = JSON.parse(message);
      console.log('json.operation', json.operation);
      const query_sql = json?.query;
      switch (json.operation) {
        case 'connect':
          // 使用从消息中解析出的连接信息创建数据库连接
          connection = createConnection(json.connectionInfo);
          if (connection !== null) {
            ws.send(JSON.stringify({ code: '2000', type: 'connect' }));
          } else {
            ws.send(JSON.stringify({ code: '2001' }));
          }
          console.log('连接信息：', json.connectionInfo);
          break;
        case 'query_database':
          if (!connection) {
            ws.send(JSON.stringify({ error: '未建立数据库连接', code: '2001' }));
            return;
          }
          // 执行查询
          connection.query(query_sql, (err, results, fields) => {
            if (err) {
              ws.send(JSON.stringify({ error: err.stack, code: '2001' }));
              return;
            }
            // 列出非系统库
            results.forEach((database, index) => {
              if (tableWiteList.includes(database.Database)) {
                results.splice(index, 1);
              }
            });
            ws.send(JSON.stringify({ results: results, code: '2000', type: 'query_database' }));
          });
          break;
        case 'query_tables':
          if (!connection) {
            ws.send(JSON.stringify({ error: '未建立数据库连接', code: '2001' }));
            return;
          }
          // 执行查询
          connection.query(query_sql, (err, results, fields) => {
            if (err) {
              ws.send(JSON.stringify({ error: err.stack, code: '2001' }));
              return;
            }
            ws.send(JSON.stringify({ results: results, code: '2000', type: 'query_tables' }));
          });
          break;
        case 'query_table_fields':
          if (!connection) {
            ws.send(JSON.stringify({ error: '未建立数据库连接', code: '2001' }));
            return;
          }

          // 执行查询
          connection.query(query_sql, (err, results, fields) => {
            if (err) {
              ws.send(JSON.stringify({ error: err.stack, code: '2001' }));
              return;
            }
            ws.send(JSON.stringify({ results: results, code: '2000', type: 'query_table_fields', curVal: json.curVal }));
          });
          break;
        case 'query_views':
          if (!connection) {
            ws.send(JSON.stringify({ error: '未建立数据库连接', code: '2001' }));
            return;
          }
          // 执行查询
          connection.query(query_sql, (err, results, fields) => {
            if (err) {
              ws.send(JSON.stringify({ error: err.stack, code: '2001' }));
              return;
            }
            ws.send(JSON.stringify({ results: results, code: '2000', type: 'query_views' }));
          });
          break;
        case 'query_views_fields':
          if (!connection) {
            ws.send(JSON.stringify({ error: '未建立数据库连接', code: '2001' }));
            return;
          }
          // 执行查询
          connection.query(query_sql, (err, results, fields) => {
            if (err) {
              ws.send(JSON.stringify({ error: err.stack, code: '2001' }));
              return;
            }
            ws.send(JSON.stringify({ results: results, code: '2000', type: 'query_views_fields' }));
          });
          break;
        case 'creating':
          if (!connection) {
            ws.send(JSON.stringify({ error: '未建立数据库连接', code: '2001' }));
            return;
          }
          const jsonString = JSON.stringify(query_sql, null, 2); // 缩进为2的空格
          const params = {
            thePath: path.join(__dirname, './config/configs.json'),
            data: jsonString,
          }
          // 生成本地配置
          createFile(params, ws).then((res) => {
            console.log(res);
            // 执行生成项目
            // createProjectWithSQL(ws) // 生成 sql语句的接口项目
            createProjectWithORM(ws) // 生成 ORM框架的接口项目
          }).catch(err => {
            console.log(err);
          })

          break;
        case 'query_test':
          if (!connection) {
            ws.send(JSON.stringify({ error: '未建立数据库连接', code: '2001' }));
            return;
          }
          // 执行查询
          connection.query(query_sql, (err, results, fields) => {
            if (err) {
              ws.send(JSON.stringify({ error: err.stack, code: '2001' }));
              return;
            }
            ws.send(JSON.stringify({ results: results, code: '2000', type: 'query_test', curVal: json.curVal }));
          });
          break;
        default:
          ws.send(JSON.stringify({ error: '未知的操作类型' }));
          break;
      }
    } catch (error) {
      ws.send(JSON.stringify({ error: error.stack }));
    }
  });

  ws.on('close', () => {
    console.log('WebSocket连接关闭');
    // 在连接关闭时处理数据库连接的清理
    if (connection) {
      connection.end();
      connection = null;
    }
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
console.log(`服务器正在运行在端口 ${PORT}`);
