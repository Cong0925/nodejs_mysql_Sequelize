// 导入router所需的方法
import { createRouter, createWebHashHistory } from 'vue-router'
// 导入路由页面的配置
import routes from './route'
import { Session } from '@/utils/cookieSet';
// 路由参数配置
const router = createRouter({
    // 使用hash(createWebHashHistory)模式，(createWebHistory是HTML5历史模式，支持SEO)
    history: createWebHashHistory(),
    routes: routes,
})

// 全局前置守卫，这里可以加入用户登录判断
router.beforeEach((to, from, next) => {
    const routes = router.getRoutes();
    const index = routes.findIndex(route => route.path === to.path) - routes.findIndex(route => route.path === from.path);
    console.log(routes, index, to.path, from.path)
    if (to.path === '/') {
        Session.set('activeStep', 1)
        next();
    } else {
        console.log(Session.get('connectionInfo'))
        if (Session.get('connectionInfo')?.database === '' || Session.get('connectionInfo')?.database === undefined) {
            Session.set('activeStep', 1)
            next({ path: '/' })
        }
        if (index === 1 || index === -1) {
            Session.set('activeStep', Session.get('activeStep') + index)
            next();
        } else {
            next({ path: from.path });
        }
    }
})


// 全局后置钩子，这里可以加入改变页面标题等操作
router.afterEach((to, from) => {
    const _title = to.meta.title
    if (_title) {
        window.document.title = String(_title)
    }
})

// 导出默认值
export default router