import { RouteRecordRaw } from 'vue-router'
 
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'step1',
    component: () => import('@/views/step1.vue'),
    meta: {
      title: '首页'
    },
  },
  {
    path: '/step2',
    name: 'step2',
    component: () => import('@/views/step2.vue'),
    meta: {
      title: 'step2'
    },
  },
  {
    path: '/step3',
    name: 'step3',
    component: () => import('@/views/step3.vue'),
    meta: {
      title: 'step3'
    },
  },
  {
    path: '/step4',
    name: 'step4',
    component: () => import('@/views/step4.vue'),
    meta: {
      title: 'step4'
    },
  },
  {
    path: '/step5',
    name: 'step5',
    component: () => import('@/views/step5.vue'),
    meta: {
      title: 'step5'
    },
  },
]
export default routes