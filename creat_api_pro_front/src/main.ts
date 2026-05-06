import { createApp } from 'vue'
import './assets/css/index.css'
import App from './App.vue'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 导入 Element Plus 中文语言包
import zhCn from 'element-plus/dist/locale/zh-cn'

// 导入新建的路由文件
import router from "./router/index"
// 引入Vuex Store
import store from './store';

const app = createApp(App)
app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
})
app.use(store)


app.mount('#app')
