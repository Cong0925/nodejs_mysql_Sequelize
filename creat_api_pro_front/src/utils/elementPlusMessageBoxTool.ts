// 使用方法 引入下方代码即可
// utils 导入
// import { ElMessageBoxTool, ElMessageTool } from "@/utils/elementPlusMessageBoxTool";

// 组件导入
import { ElMessage, ElMessageBox } from 'element-plus';
import type { Action } from 'element-plus'
export const ElMessageTool = (tipInfo: any, type: any) => {
  ElMessage({
    type: type,
    message: tipInfo,
  });
}

export const ElMessageBoxConfirmTool = (tipInfo: any, type: any, okFun: any, canselFun: any) => {
  ElMessageBox.confirm(tipInfo, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: type,
  })
    .then(() => {
      okFun()
    })
    .catch(() => {
      canselFun()
    });
}

export const ElMessageBoxAlertTool = (tipInfo: any, callback: any) => {
  ElMessageBox.alert(tipInfo, '提示', {
    // if you want to disable its autofocus
    autofocus: true,
    confirmButtonText: '确认',
    callback: callback,
  })
}