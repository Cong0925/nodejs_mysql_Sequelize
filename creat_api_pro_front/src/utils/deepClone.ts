/**
 * 深拷贝一个对象
 *
 * @param obj 需要深拷贝的对象
 * @returns 返回拷贝后的对象
 */
function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  let clone: any;

  if (obj instanceof Array) {
    clone = [];
    for (let i = 0; i < obj.length; i++) {
      clone[i] = deepClone(obj[i]);
    }
  } else {
    clone = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clone[key] = deepClone(obj[key]);
      }
    }
  }

  return clone;
}

export default deepClone;
