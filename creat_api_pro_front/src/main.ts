import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 导入新建的路由文件
import router from "./router/index"
// 引入Vuex Store
import store from './store';

const app = createApp(App)
app.use(router)
app.use(ElementPlus)
app.use(store)


app.mount('#app')
