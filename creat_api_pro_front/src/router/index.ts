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

    // 计算路由索引（修复：找不到时给 -1，避免 NaN）
    const toIndex = isNaN(Number(to.path.slice(-1))) ? 1 : Number(to.path.slice(-1));
    const fromIndex =isNaN(Number(from.path.slice(-1))) ? 1 : Number(from.path.slice(-1));
    let index = toIndex
    
    // ==================================
    // 1. 刷新页面特殊处理：from 是 / 且 to 不是 /
    // ==================================
    const isPageRefresh = from.path === '/' && to.path !== '/' && from.name === undefined;

    // ==================================
    // 2. 访问首页
    // ==================================
    if (to.path === '/') {
        Session.set('activeStep', 1);
        return next();
    }

    // ==================================
    // 3. 未配置连接信息 → 强制回到首页
    // ==================================
    const connectionInfo = Session.get('connectionInfo');
    if (!connectionInfo || connectionInfo.database === '' || connectionInfo.database === undefined) {
        Session.set('activeStep', 1);
        return next({ path: '/' });
    }

    // ==================================
    // 4. 刷新页面 → 允许进入，自动匹配正确 step
    // ==================================
    if (isPageRefresh) {
        // 你可以根据路由路径自动设置 activeStep
        // 示例：根据路径匹配步骤
        Session.set('activeStep', 1);
        return next({ path: '/' });
    }

    // ==================================
    // 5. 正常前进/后退
    // ==================================
    if (index === 1 || index !== -1) {
        const currentStep = Session.get('activeStep') || 1;
        Session.set('activeStep', currentStep );
        return next();
    }

    // ==================================
    // 6. 非法跳转 → 阻止
    // ==================================
    next({ path: from.path });

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