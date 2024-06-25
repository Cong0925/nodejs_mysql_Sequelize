// src/store/index.js
import { createStore } from 'vuex';

// 如果你有多个模块，可以在这里导入它们
import websocket from './websocket';
import saveConfig from './saveConfig';
import stepMark from './stepMark';


export default createStore({
  state: {
    // 定义状态
  },
  mutations: {
    // 定义改变状态的方法
  },
  actions: {
    // 定义提交mutation的方法
  },
  getters: {
    getMessage: (state, getters, rootState) => {
      // 这里调用websocket模块的getter来获取message
      return getters['websocket/message'];
    },
    getWebSocketState: (state, getters, rootState) => {
      // 这里调用websocket模块的getter来获取message
      return getters['websocket/webSocketState'];
    },
    getActiveStep: (state, getters, rootState) => {
      // 这里调用websocket模块的getter来获取message
      return getters['stepMark/activeStep'];
    },
    getDataConfigLocal: (state, getters, rootState) => {
      // 这里调用websocket模块的getter来获取message
      return getters['saveConfig/dataConfigLocal'];
    }
  },
  modules: {
    websocket,
    saveConfig,
    stepMark
  }
});
