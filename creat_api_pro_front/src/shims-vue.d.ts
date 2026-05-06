// src/shims-vue.d.ts
// 这个文件的作用就是告诉 TypeScript：所有 .vue 文件都是 Vue 组件，允许你导入它们。

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}