<template>
  <el-card style="margin-top: 20px;">
    <div style="display: flex; justify-content: space-between;">
      <div class="sider" style="flex: 1;">
        <el-card style="min-height:700px;">
          <div style="display: flex;flex-direction: column">
            <el-checkbox v-model="state.isCheckAll" :indeterminate="state.isIndeterminate"
              @change="handleCheckAllChange">
              全选
            </el-checkbox>
          </div>
          <el-checkbox-group v-model="state.checkedTables" @change="handleCheckedTablesChange"
            style="display: flex;flex-direction: column">
            <el-checkbox v-for="(_value, key) in state.tables" :key="key" :label="key" :value="key" size="large"
              :class="{ 'now-actived': state.selectedNowTable === key }">
              {{ key }}
            </el-checkbox>
          </el-checkbox-group>
        </el-card>
      </div>
      <div class="table-main" style="flex: 3; margin-left: 20px; ">
        <el-affix :offset="30">
          <div style="    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);padding: 10px;">
            <div style="margin: 10px;">
              <span style="font-size: 24px;font-weight: bold;">当前表：{{ state.selectedNowTable }}</span>
            </div>
            <el-card style="min-height: 100px;margin-bottom: 25px">
              <template #header>
                <div class="card-header">
                  <span style="font-weight: bold;font-size: larger;">数据记录是否逻辑删除</span>
                </div>
              </template>
              <div style="display: flex;margin-bottom: 20px;">
                <div>
                  <div style="display: flex;font-weight: bold;margin: 10px 0;font-size: medium;">逻辑删除字段</div>
                  <div style="display: flex;">
                    <el-select v-model="state.tables[state.selectedNowTable].logicDelField" filterable
                      placeholder="Select" style="width: 240px">
                      <el-option
                        v-for="item in state.tables[state.selectedNowTable].fields.filter(field => CONFIG.intType.includes(field.Type))"
                        :key="item.Field" :label="item.Field" :value="item.Field" />
                    </el-select>
                  </div>
                  <div style="margin-top: 20px;">
                    <span>推荐命名为:</span>
                    <span style="margin-left: 10px;color: #d96060;">{{ CONFIG.logicalDelFieldOptions }}</span>
                  </div>
                </div>
              </div>
            </el-card>
            <el-card style="min-height: 200px;margin-bottom: 25px">
              <template #header>
                <div class="card-header">
                  <span style="font-weight: bold;font-size: larger;">主键设置</span>
                </div>
              </template>
              <div style="display: flex;margin-bottom: 20px;">
                <div style="flex:1">
                  <div style="display: flex;font-weight: bold;margin: 10px 0;font-size: medium;">业务主键字段</div>
                  <div style="display: flex;">
                    <el-select v-model="state.tables[state.selectedNowTable].primaryKeyField" filterable
                      placeholder="Select" style="width: 240px">
                      <el-option v-for="item in state.tables[state.selectedNowTable].fields" :key="item.Field"
                        :label="item.Field" :value="item.Field" />
                    </el-select>
                  </div>
                </div>
                <div style="flex:1">
                  <div style="display: flex;font-weight: bold;margin: 10px 0;font-size: medium;">业务主键生成规则</div>
                  <div style="display: flex;">
                    <el-select v-model="state.tables[state.selectedNowTable].primaryKeyFieldRule" filterable
                      placeholder="Select" style="width: 240px">
                      <el-option v-for="item in CONFIG.primaryKeyFieldRules" :key="item" :label="item" :value="item" />
                    </el-select>
                  </div>
                </div>
              </div>
            </el-card>
            <el-card style="min-height: 200px;">
              <template #header>
                <div class="card-header">
                  <span style="font-weight: bold;font-size: larger;">选择加密字段</span>
                </div>
              </template>
              <div>
                <el-scrollbar height="150px">
                  <el-checkbox-group v-model="state.tables[state.selectedNowTable].encipherField"
                    @change="handleCheckedEncipherFieldsChange" style="display: flex;flex-wrap: wrap; /* 启用换行 */">
                    <el-checkbox v-for="item in state.tables[state.selectedNowTable].fields" :key="item.Field"
                      :label="item.Field" :value="item.Field"
                      style="width: calc(100% / 4); margin: 0 10px;overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                      <el-tooltip class="box-item" effect="dark" :content="item.Field" placement="top-start">
                        {{ item.Field }}
                      </el-tooltip>
                    </el-checkbox>
                  </el-checkbox-group>
                </el-scrollbar>

              </div>
            </el-card>
            <div style="margin: 10px;display: flex;justify-content: end;">
              <el-button type="primary" @click="handlePrev">上一步</el-button>
              <el-button type="primary" @click="handleNext">下一步</el-button>
            </div>
          </div>
        </el-affix>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { FieldState } from '@/interface';
import router from '@/router';
import { Session } from '@/utils/cookieSet';
import { onMounted, reactive, watch } from 'vue';

import CONFIG from '@/config/index'

import { useStore } from 'vuex';
const store = useStore();

interface State {
  isCheckAll: boolean
  isIndeterminate: boolean

  primaryKeyFieldRules: Array<string> // 主键生成规则

  tables: {
    [key: string]: {
      isSelected: boolean, //当前表是否选中
      name: string,  //表名
      logicDelField: string,   //逻辑删除字段
      primaryKeyField: string,   //主键字段
      primaryKeyFieldRule: string, //主键字段规则
      encipherField: Array<string>  //加密字段
      fields: Array<FieldState>,
    }
  }

  checkedTables: Array<string>
  allTables: Array<string>

  selectedNowTable: string
}
const state: State = reactive({
  isCheckAll: false, // 是否全选
  isIndeterminate: true, // 是否半选
  primaryKeyFieldRules: ['规则一', '规则二', '规则三'], // 主键生成规则
  tables: {
    defaultTable: {
      isSelected: false, //当前表是否选中
      name: 'defaultTable',  //表名
      logicDelField: '',   //逻辑删除字段
      primaryKeyField: '',   //主键字段
      primaryKeyFieldRule: '', //主键字段规则
      encipherField: [],  //加密字段
      fields: [{
        Default: '', //默认值
        Extra: '', //额外信息
        Field: 'defaultField', //字段名
        Key: '', //是否主键
        Null: '', //是否为空
        Type: '', //类型
      }],
    }
  },

  checkedTables: ['defaultTable'], // 已经选择的表
  allTables: [], // 所有表

  selectedNowTable: 'defaultTable', // 当前选择的表
})

// 监听返回值
watch(() => store.getters.getMessage, (_newVal: any) => {
  // console.log('message', store.getters.getMessage, newVal)
  solveBackMsg()
})
// 监听 表的选取
watch(() => state.checkedTables, (newVal: any, oldVal: any) => {
  if (newVal.length < oldVal.length) {
    let re = oldVal.filter((item: any) => !newVal.includes(item));
    re.forEach((item: any) => {
      state.tables[item].isSelected = false
    })
  }
})
import { findMostSimilarWithId } from '@/utils/differ'
// 消息处理函数
const solveBackMsg = async () => {
  let data = store.getters.getMessage
  if (data.error) {
    console.error(data.error);
  } else if (data.code === '2000') {
    if (data.type === 'connect') {
      console.log('重连成功')
    }
    // 收到 所有表的查询结果
    if (data.type === 'query_tables') {
      state.allTables = data.results.map((item: any) => {
        return item[`Tables_in_${Session.get('connectionInfo').database}`];
      });
      state.checkedTables.push(state.allTables[0]);
      state.selectedNowTable = state.allTables[0];
      state.checkedTables.splice(0, 1);
      await initTables() // 表结构初始化
      state.tables[state.selectedNowTable].isSelected = true;
      searchTableFields() // 发送查询所有字段命令
    }
    // 收到 当前表的所有字段 查询结果
    if (data.type === 'query_table_fields') {
      console.log(data.curVal)
      state.tables[data.curVal].fields = data.results;
      state.tables[data.curVal].isSelected = true;
      state.tables[data.curVal].primaryKeyField =  findMostSimilarWithId(data.curVal,data.results.map((item: any) => item.Field))
      state.tables[data.curVal].primaryKeyFieldRule = data.results.find((item: any) => item.Key !== '')?.Extra === CONFIG.primaryKeyFieldRules[0] ? CONFIG.primaryKeyFieldRules[0] : '';
      state.tables[data.curVal].logicDelField = data.results.find((item: any) => CONFIG.logicalDelFieldOptions.includes(item.Field))?.Field;
    }

    // 测试查询
    if (data.type === 'query_test') {
    }

  } else if (data.code === '2001') {
    console.log('数据库连接错误，检查参数')
  }
}

// 加载表信息
onMounted(async () => {
  if (Object.keys(Session.get('Config').tables).length === 0) {
    const queryData = {
      operation: 'query_tables',
      query: "show full tables where Table_type = 'BASE TABLE';"
    };
    // 发送查询所有表的请求
    await store.dispatch('websocket/executeQuery', queryData)
  } else {
    state.tables = Session.get('Config').tables
    state.checkedTables = Session.get('Config').selectedTables
    state.allTables = Object.keys(Session.get('Config').tables)
    state.selectedNowTable = state.allTables[0]
  }
})

// 表全选
const handleCheckAllChange = async (val: boolean) => {
  state.checkedTables = val ? state.allTables : []
  state.isIndeterminate = false
  for (let key in state.tables) {
    state.tables[key].isSelected = val
    state.selectedNowTable = key
    searchTableFields()
  }

}
// 表单选
const handleCheckedTablesChange = async (value: string[]) => {
  const checkedCount = value.length // 选中的个数
  state.isCheckAll = checkedCount === state.allTables.length // 当前选中个数 是否等于总长度
  state.isIndeterminate = checkedCount > 0 && checkedCount < state.allTables.length // 当前选中个数 是否大于0 小于总长度
  state.selectedNowTable = value[value.length - 1] // 当前选中是数组的最后一个
  saveConfig()
  searchTableFields()
}
// 加密字段单选
const handleCheckedEncipherFieldsChange = async (value: string[]) => {
  console.log(value)
}
// 查询当前表所有字段
const searchTableFields = async () => {
  const params = {
    operation: 'query_table_fields',
    query: `SHOW COLUMNS FROM \`${state.selectedNowTable}\`;`,
    curVal: state.selectedNowTable
  }
  await store.dispatch('websocket/executeQuery', params)
}

// 上一步
const handlePrev = () => {
  store.dispatch('stepMark/setActiveStep', 1)
  router.push({ name: 'step1', params: {} })
}
// 下一步
const handleNext = () => {
  store.dispatch('stepMark/setActiveStep', 3)
  saveConfig()
  router.push({ name: 'step3', params: {} })
}


// 存储当前配置到config中
const saveConfig = async () => {
  // 创建一个新的对象，只包含需要修改的属性
  const updatedConfig = {
    selectedTables: state.checkedTables,
    tables: state.tables
  }
  const newDataConfigLocal = {
    ...Session.get('Config'),
    ...updatedConfig,
  };
  Session.set('Config', newDataConfigLocal)
}

// 初始化表结构
const initTables = () => {
  state.tables = state.allTables.reduce(function (accumulator: any, currentValue: any, _index) {
    accumulator[currentValue] = {
      isSelected: false, //当前表是否选中
      name: currentValue,  //表名
      logicDelField: '',  //逻辑删除字段
      primaryKeyField: '',  //主键字段
      primaryKeyFieldRule: '',
      encipherField: [],  //加密字段
      fields: [],
    };
    return accumulator;
  }, {});
}

</script>

<style scoped>
.now-actived {
  background-color: #d2f0ff;
}

.item:hover {
  transform: translateX(-50%);
  /* 鼠标悬浮时向左移动自身宽度的50% */
}
</style>