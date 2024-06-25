/* 
完整参数示例
dataConfigLocal: {
      outPath:'creat_api_pro_server/dist/', //输出路径 目前只能在默认路径
      projectName:'',
      host: '', //数据库地址
      port: 3306, //数据库端口
      user: '', //数据库用户名
      password: '', //数据库密码
      database: '', //数据库名
      tables: {
        user: {
          isSelected:true, //当前表是否选中
          name:'user',  //表名
          logicDelField: '',  //逻辑删除字段
          primaryKeyField: '',  //主键字段
          primaryKeyFieldRule:'', //主键规则
          encipherField: [],  //加密字段
          fields:{
            user_id:{
              Default:'', //默认值
              Extra: '', //额外信息
              Field: '', //字段名
              Key: '', //是否主键
              Null: '', //是否为空
              Type: '', //类型
            },
            ... 其他字段
          },
        },
      ... 其他表
      },
      views:{
        view1:{
          isSelected:true, //当前表是否选中
          name:'user',  //表名
          toSearchFields: [],  //查询字段
          fields:{
            user_id:{
              Default:'', //默认值
              Extra: '', //额外信息
              Field: '', //字段名
              Key: '', //是否主键
              Null: '', //是否为空
              Type: '', //类型
            },
            ... 其他字段
          },
        }
      ... 其他视图
      }
      selectedTables: [],
      selectedViews: [],
    }
     
*/

export default {
  namespaced: true,
  state: {
    dataConfigLocal: {
      outPath: 'creat_api_pro_server/dist/',
      projectName:'',
      host: '',
      port: 3306,
      user: '',
      password: '',
      database: '',
      tables: {},
      selectedTables: [],
      views: {},
      selectedViews: []
    }
  },
  mutations: {
    SET_CONFIG(state: any, data: any) {
      state.dataConfigLocal = data;
    },
    CLEAR_CONFIG(state: any) {
      state.dataConfigLocal = {
        outPath: 'creat_api_pro_server/dist/',
        projectName:'',
        host: '',
        port: 3306,
        user: '',
        password: '',
        database: '',
        tables: {},
        selectedTables: [],
        views: {},
        selectedViews: []
      };
    },
  },
  getters: {
    dataConfigLocal: (state: any) => state.dataConfigLocal
  },
  actions: {
    async setConfig({ commit }: any, data: any) {
      commit('SET_CONFIG', data);
    },
    async clearConfig({ commit }: any) {
      commit('CLEAR_CONFIG');
    },
  },
};
