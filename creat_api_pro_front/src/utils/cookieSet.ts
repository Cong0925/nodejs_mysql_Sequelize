import { useCookies } from '@vueuse/integrations/useCookies'
import Cookies from 'js-cookie';

const cookie = useCookies()

/**
 * Cookie 临时缓存
 * @method set 设置临时缓存
 * @method get 获取临时缓存
 * @method remove 移除临时缓存
 * @method clear 移除全部临时缓存
 */
export const Cookie = {
  // 设置临时缓存
  setCookies(name:any, value:any) {
    // 设置 登录凭证时间
    // const expirationDays = 1;
    // const expirationDate = new Date();
    // expirationDate.setDate(expirationDate.getDate() + expirationDays);
    const expirationMinutes = 60; //超时时间 /分钟
    const expirationDate = new Date();
    expirationDate.setTime(expirationDate.getTime() + expirationMinutes * 60 * 1000);
    return cookie.set(name, value, { expires: expirationDate })
  },
  // 获取临时缓存
  getCookies(key: string) {
    return Cookies.get(key);
  },
  removeCookies(name:any) {
    return cookie.remove(name)
  },
};

/**
 * window.localStorage 浏览器永久缓存
 * @method set 设置永久缓存
 * @method get 获取永久缓存
 * @method remove 移除永久缓存
 * @method clear 移除全部永久缓存
 */
export const Local = {
	// 设置永久缓存
	set(key: string, val: any) {
		window.localStorage.setItem(key, JSON.stringify(val));
	},
	// 获取永久缓存
	get(key: string) {
		let json: any = window.localStorage.getItem(key);
		return JSON.parse(json);
	},
	// 移除永久缓存
	remove(key: string) {
		window.localStorage.removeItem(key);
	},
	// 移除全部永久缓存
	clear() {
		window.localStorage.clear();
	},
};

/**
 * window.sessionStorage 浏览器临时缓存
 * @method set 设置临时缓存
 * @method get 获取临时缓存
 * @method remove 移除临时缓存
 * @method clear 移除全部临时缓存
 */
export const Session = {
	// 设置临时缓存
	set(key: string, val: any) {
		if (key === 'token') return Cookies.set(key, val);
		window.sessionStorage.setItem(key, JSON.stringify(val));
	},
	// 获取临时缓存
	get(key: string) {
		if (key === 'token') return Cookies.get(key);
		let json: any = window.sessionStorage.getItem(key);
		return JSON.parse(json);
	},
	// 移除临时缓存
	remove(key: string) {
		if (key === 'token') return Cookies.remove(key);
		window.sessionStorage.removeItem(key);
	},
	// 移除全部临时缓存
	clear() {
		Cookies.remove('token');
		window.sessionStorage.clear();
	},
};
