// store/websocket.ts
import CONFIG from '@/config/index';
import { Session } from '@/utils/cookieSet';
import { ElMessage } from 'element-plus';

/**
 * 定义 WebSocket 模块的状态类型（TS 严格类型校验）
 * 解决隐式 any、类型不匹配问题
 */
interface WebSocketState {
  socket: WebSocket | null;               // WebSocket 实例对象
  databaseConnection: any;                // 数据库连接实例（备用字段）
  message: any;                          // 存储后端返回的消息数据
  reconnectInterval: number;             // 重连间隔时间（毫秒）
  maxReconnectTimes: number;              // 最大重连次数
  reconnectTimes: number;                // 当前已经重连的次数
  reconnectTimer: NodeJS.Timeout | null;  // 重连定时器 ID（TS 标准类型）
  isReconnecting: boolean;                // 重连状态锁：防止重复触发重连
  lastConnectionData: any;                // 【新增】保存第一次的连接数据
}

export default {
  // 开启命名空间，避免与其他 Vuex 模块冲突
  namespaced: true,

  /**
   * 状态数据：必须用函数返回，防止多实例数据污染
   */
  state: (): WebSocketState => ({
    socket: null,
    databaseConnection: null,
    message: null,
    reconnectInterval: 1000,    // 每隔 1 秒重试一次
    maxReconnectTimes: 3,       // 最多重试 3 次
    reconnectTimes: 0,          // 初始重连次数为 0
    reconnectTimer: null,       // 定时器初始为空
    isReconnecting: false,      // 初始未在重连
    lastConnectionData: null    // 【新增】存储最后一次连接数据
  }),

  /**
   * 同步修改 state 的方法（唯一修改 state 的入口）
   */
  mutations: {
    // 【新增】保存最后一次连接数据
    SET_LAST_CONNECTION_DATA(state: WebSocketState, data: any) {
      state.lastConnectionData = data;
    },

    // 保存 WebSocket 实例
    SET_SOCKET(state: WebSocketState, socket: WebSocket | null) {
      state.socket = socket;
    },

    // 保存数据库连接信息（备用）
    SET_DATABASE_CONNECTION(state: WebSocketState, connection: any) {
      state.databaseConnection = connection;
    },

    // 存储后端返回的消息
    SET_MESSAGE(state: WebSocketState, message: any) {
      state.message = message;
    },

    // 保存重连定时器 ID
    SET_RECONNECT_TIMER(state: WebSocketState, timer: NodeJS.Timeout) {
      state.reconnectTimer = timer;
    },

    // 连接成功 → 重置重连次数为 0
    RESET_RECONNECT_TIMES(state: WebSocketState) {
      state.reconnectTimes = 0;
    },

    // 清除重连定时器，防止定时器堆积
    CLEAR_RECONNECT_TIMER(state: WebSocketState) {
      if (state.reconnectTimer) {
        clearTimeout(state.reconnectTimer);
        state.reconnectTimer = null;
      }
    },

    // 设置重连状态锁（true = 正在重连，false = 未重连）
    SET_RECONNECTING(state: WebSocketState, value: boolean) {
      state.isReconnecting = value;
    },
  },

  /**
   * 计算属性：快捷获取 state 数据
   */
  getters: {
    message: (state: WebSocketState) => state.message,
    webSocketState: (state: WebSocketState) => state,
  },

  /**
   * 异步操作：处理连接、重连、消息发送
   */
  actions: {
    /**
     * 建立 WebSocket 连接
     * @param connectionData 连接认证数据
     * @param queryData 可选：需要立即执行的查询语句
     */
    async connect({ commit, state, dispatch }: any, { connectionData, queryData }: { connectionData: any; queryData?: any }) {
      // 每次新建连接前，先清除旧的重连定时器，避免多个定时器同时执行
      commit('CLEAR_RECONNECT_TIMER');

      try {
        // 【关键】保存第一次传入的连接数据，用于重连
        commit('SET_LAST_CONNECTION_DATA', connectionData);

        // 1. 创建 WebSocket 连接实例
        const socket = new WebSocket(CONFIG.WS_URL);
        commit('SET_SOCKET', socket);

        // 2. 监听后端返回的消息
        socket.onmessage = (event: MessageEvent) => {
          commit('SET_MESSAGE', JSON.parse(event.data));
        };

        // ==============================================
        // 【核心修复】只监听 onclose 触发重连
        // 避免 onerror + onclose 同时触发，导致重复弹窗
        // ==============================================
        socket.onclose = (event: CloseEvent) => {
          // 非正常关闭（code !== 1000）+ 未在重连 → 才触发重连
          if (event.code !== 1000 && !state.isReconnecting) {
            dispatch('reconnect', queryData);
          }
        };

        // 【屏蔽】onerror 中的重连触发，只保留日志/空实现
        socket.onerror = () => { };

        // 3. 等待 WebSocket 连接成功
        await new Promise((resolve) => {
          socket.onopen = () => {
            console.log('✅ WebSocket 连接成功');
            // 连接成功：重置重连次数 + 关闭重连锁
            commit('RESET_RECONNECT_TIMES');
            commit('SET_RECONNECTING', false);

            // 发送连接认证信息
            socket.send(JSON.stringify(connectionData));

            // 如果有查询数据，立即执行查询
            if (queryData) dispatch('executeQuery', queryData);

            resolve(true);
          };
        });

      } catch (error) {
        console.error('❌ WebSocket 连接异常：', error);
      }
    },

    /**
     * 重连方法（核心）
     * 加锁机制：确保永远只执行一次，不会重复弹窗
     */
    async reconnect({ commit, state, dispatch }: any, queryData: any) {
      // ========================
      // 【原子重连锁】
      // 如果已经在重连，直接返回，防止重复执行
      // ========================
      if (state.isReconnecting) return;
      // 立即上锁，阻止其他调用进入
      state.isReconnecting = true;
      commit('SET_RECONNECTING', true);

      // ========================
      // 达到最大重连次数 → 停止重连
      // 【只会执行 1 次】
      // ========================
      if (state.reconnectTimes >= state.maxReconnectTimes) {
        console.log('❌ 重连次数耗尽，停止重连');
        ElMessage.error('WebSocket 连接失败，请检查服务是否启动');

        // ========================
        // ✅ 你要的：连接彻底失败 → 给页面发消息
        // ========================
        commit('SET_MESSAGE', { error: 'WS连接失败' });

        // ========================
        // ✅【关键修复】
        // 次数耗尽后必须重置为 0，下次才能正常重连
        // ========================
        commit('RESET_RECONNECT_TIMES');

        // 清理定时器 + 解锁
        commit('CLEAR_RECONNECT_TIMER');
        commit('SET_RECONNECTING', false);
        return;
      }

      // ========================
      // 执行重连：次数 +1，提示用户
      // ========================
      state.reconnectTimes++;
      console.log(`🔌 第 ${state.reconnectTimes} 次重连`);
      ElMessage.error(`WS 连接失败，请检查服务是否启动（第 ${state.reconnectTimes} 次尝试/max:3）...`);

      // 延迟指定时间后，重新发起连接
      const timer = setTimeout(() => {
        // 解锁，允许下一次重连
        commit('SET_RECONNECTING', false);

        // 重新构建连接参数
        const connectionData = state.lastConnectionData

        // 重新调用 connect 方法
        dispatch('connect', { connectionData, queryData });
      }, state.reconnectInterval);

      // 保存定时器 ID
      commit('SET_RECONNECT_TIMER', timer);
    },

    /**
     * 执行 SQL 查询
     */
    async executeQuery(that: any, queryData: any) {
      // 必须确保 WebSocket 连接已打开才能发送消息
      if (that.state.socket?.readyState === WebSocket.OPEN) {
        that.state.socket.send(JSON.stringify(queryData));
      } else {
        console.log('⚠️ 连接已断开，正在重连...');
        // 连接断开，自动触发重连
        that.dispatch('reconnect', queryData);
      }
    },
  },
};