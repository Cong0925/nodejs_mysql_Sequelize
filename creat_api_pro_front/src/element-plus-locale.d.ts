// TypeScript 会自动识别这个声明，就不会报找不到模块的错误了。
declare module 'element-plus/dist/locale/*' {
  import type { Language } from 'element-plus/es/locale'
  const locale: Language
  export default locale
}