// common.js
// utils/myFun.js

function strFormatConvert(string) {
  let newString = '';
  for (let word of string.split('_')) {
    if (newString) {
      newString += word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    } else {
      newString = word;
    }
  }
  return newString;
}

function strToAllSmall(string) {
  return string.replace(/_/g, '').toLowerCase();
}

function strToLittleCamelCase(string) {
  let newString = '';
  for (let word of string.split('_')) {
    if (newString) {
      newString += word.charAt(0).toUpperCase() + word.slice(1);
    } else {
      newString = word;
    }
  }
  return newString;
}

function strToBigCamelCase(string) {
  let newString = '';
  for (let word of string.split('_')) {
    newString += word.charAt(0).toUpperCase() + word.slice(1);
  }
  return newString;
}

function standardStr(inStr) {
  let strList = inStr.split('');
  let flag = false;
  for (let i of inStr) {
    if (i.toUpperCase() === i) {
      flag = true;
    }
  }
  if (flag) {
    for (let i of inStr) {
      if (i.toUpperCase() === i) {
        let index = strList.indexOf(i);
        if (index === 0) {
          strList[index] = i.toLowerCase();
          continue;
        }
        strList[index] = i.toLowerCase();
        strList.splice(index, 0, '-');
      } else if (!/[a-zA-Z0-9]/.test(i)) {
        strList[strList.indexOf(i)] = '';
      }
    }
  }
  let outStr = strList.join('').replace(/_/g, '-');
  return outStr;
}

module.exports = {
  strFormatConvert,
  strToAllSmall,
  strToLittleCamelCase,
  strToBigCamelCase,
  standardStr
};