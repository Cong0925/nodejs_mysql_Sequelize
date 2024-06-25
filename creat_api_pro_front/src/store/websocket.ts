// store/websocket.ts
import CONFIG from '@/config/index';
import { Session } from '@/utils/cookieSet';
import { useStore } from 'vuex';
const store = useStore();

export default {
  namespaced: true,
  state: {
    socket: null as WebSocket | null,
    databaseConnection: null as any, // 用于存储数据库连接实例
    message: null,
    reconnectInterval: 1000, // 重连间隔时间，单位为毫秒
    maxReconnectTimes: 5, // 最大重连次数
    reconnectTimes: 0, // 当前重连次数
  },
  mutations: {
    SET_SOCKET(state: any, socket: WebSocket) {
      state.socket = socket;
    },
    SET_DATABASE_CONNECTION(state: any, connection: any) {
      state.databaseConnection = connection;
    },
    SET_MESSAGE(state: any, message: any) {
      state.message = message;
    },
  },
  getters: {
    message: (state: any) => state.message,
    webSocketState: (state: any) => state,
  },
  actions: {
    // 建立WebSocket连接
    async connect({ commit, state, dispatch }: any, { connectionData, queryData }: any) {
      try {
        const socket = new WebSocket(CONFIG.WS_URL);
        commit('SET_SOCKET', socket);
        // 等待连接打开
        await new Promise<void>((resolve) => {
          socket.onopen = (event) => {
            // 连接已经成功打开
            state.reconnectTimes = 1;
            console.log('WebSocket connection opened:', event);
            socket.send(JSON.stringify(connectionData));
            if (queryData) {
              dispatch('executeQuery', queryData)
            }
            resolve();
          };
        });

        socket.onmessage = (event) => {
          // 处理接收到的消息
          // 例如：console.log('Message:', event.data);
          commit('SET_MESSAGE', JSON.parse(event.data));
        };
        socket.onclose = (event) => {
          // 处理连接关闭
          // 例如：console.log('Connection closed:', event);
          // 如果不是正常关闭，则尝试重连
          if (event.code !== 1000) {
            dispatch('reconnect')
          }
        };
        socket.onerror = (error) => {
          // 处理连接错误
          // 例如：console.error('WebSocket error:', error);
          dispatch('reconnect')
        };

      } catch (error) {
        // 处理连接失败
        console.error('Failed to connect to WebSocket:', error);
      }
    },

    // 重连函数
    async reconnect({ commit, state, dispatch }: any, queryData: any) {
      if (state.reconnectTimes < state.maxReconnectTimes) {
        setTimeout(() => {
          const connectionData = {
            operation: 'connect',
            connectionInfo: Session.get('connectionInfo')
          };
          try {
            // 调用vuex上的连接方法
            dispatch('connect', { connectionData, queryData })
          } catch (error) {
            console.log(error)
          }
          state.reconnectTimes++;
        }, state.reconnectInterval);
      } else {
        console.log('WebSocket reconnect failed');
        // 这里可以添加其他重连失败的处理逻辑
      }
    },

    // sql查询语句
    async executeQuery(that: any, queryData: any,) {
      // 检查WebSocket连接是否已建立
      if (that.state.socket) {
        // 发送查询到服务器
        that.state.socket.send(JSON.stringify(queryData));
      } else {
        // 如果连接未建立，则记录错误
        console.log('连接断开，正在重连');
        that.dispatch('reconnect', queryData)
      }
    },

    // async disconnect({ commit,state }: any) {
    //   if (state.socket) {
    //     await state.socket.close();
    //     commit('SET_SOCKET', null);
    //   }
    // },
    // async connectToDatabase({ commit,state }: any, connectionInfo: any) {
    //   // 使用连接信息建立数据库连接
    //   const connection = await establishDatabaseConnection(connectionInfo);
    //   commit('SET_DATABASE_CONNECTION', connection);
    // },
    // executeQuery是一个异步操作，用于执行查询

  },
};
