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
          <el-checkbox-group v-model="state.checkedViews" @change="handleCheckedTablesChange"
            style="display: flex;flex-direction: column">
            <el-checkbox v-for="(_value, key) in state.views" :key="key" :label="key" :value="key" size="large"
              :class="{ 'now-actived': state.selectedNowView === key }">
              {{ key }}
            </el-checkbox>
          </el-checkbox-group>
        </el-card>
      </div>
      <div class="table-main" style="flex: 3; margin-left: 20px;">
        <div style="margin: 10px;">
          <span style="font-size: 24px;font-weight: bold;">当前视图：{{ state.selectedNowView }}</span>
        </div>
        <el-card style="min-height: 100px;margin-bottom: 25px">
          <template #header>
            <div class="card-header">
              <span style="font-weight: bold;font-size: larger;">接口查询字段选择</span>
            </div>
          </template>
          <el-empty v-if="state.allViews.length===0" description="暂无视图" />
          <div v-else>
            <el-scrollbar height="150px">
              <el-checkbox-group v-model="state.views[state.selectedNowView].toSearchFields"
                @change="handleCheckedEncipherFieldsChange" style="display: flex;flex-wrap: wrap; /* 启用换行 */">
                <el-checkbox v-for="item in state.views[state.selectedNowView].fields" :key="item.Field"
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
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { onMounted, reactive, watch } from 'vue';
import { useStore } from 'vuex';
import { FieldState } from '@/interface';
import router from '@/router';
import { Session } from '@/utils/cookieSet';

const store = useStore();

interface State {
  isCheckAll: boolean
  isIndeterminate: boolean

  checkedViews: Array<string>
  selectedNowView: string
  allViews: Array<string>
  views: {
    [key: string]: {
      isSelected: boolean
      name: string
      toSearchFields: Array<string>
      fields: Array<FieldState>
    }
  }
}

const state: State = reactive({
  isCheckAll: false,
  isIndeterminate: true,
  checkedViews: [],
  selectedNowView: '',
  allViews: [],
  views: {}

});

// 监听返回值
watch(() => store.getters.getMessage, (_newVal: any) => {
  // console.log('message', store.getters.getMessage, newVal)
  solveBackMsg()
})
// 监听视图选取
watch(() => state.checkedViews, (newVal: any, oldVal: any) => {
  if (newVal.length < oldVal.length) {
    let re = oldVal.filter((item: any) => !newVal.includes(item));
    re.forEach((item: any) => {
      state.views[item].isSelected = false
    })
  }
})


// 消息处理函数
const solveBackMsg = async () => {
  let data = store.getters.getMessage
  if (data.error) {
    console.error(data.error);
  } else if (data.code === '2000') {
    // 收到 所有视图的查询结果
    if (data.type === 'query_views') {
      if (data.results.length !== 0) {
        state.allViews = data.results.map((item: any) => {
          return item.Name
        })
        state.checkedViews.push(state.allViews[0]);
        state.selectedNowView = state.allViews[0];
        initViews()
        state.views[state.selectedNowView].isSelected = true;
        searchViewsFields() // 发送查询所有字段命令
      }
    }
    if (data.type === 'query_views_fields') {
      state.views[state.selectedNowView].fields = data.results;
      state.views[state.selectedNowView].isSelected = true;
    }

  } else if (data.code === '2001') {
    console.log('数据库连接错误，检查参数')
  }
}

onMounted(async () => {
  if (Object.keys(Session.get('Config').views).length === 0) {
    const queryData = {
      operation: 'query_views',
      query: "show table status where comment='view';"
    };
    // 发送查询所有表的请求
    await store.dispatch('websocket/executeQuery', queryData)
  } else {
    state.views = Session.get('Config').views
    state.checkedViews = Session.get('Config').selectedViews
    state.allViews = Object.keys(Session.get('Config').views)
    state.selectedNowView = state.allViews[0]
  }

})

// 初始化视图结构
const initViews = () => {
  state.views = state.allViews.reduce(function (accumulator: any, currentValue: any, _index: any) {
    accumulator[currentValue] = {
      isSelected: false, //当前视图是否选中
      name: currentValue,  //视图名
      toSearchFields: [],  //查询字段
      fields: [],
    };
    return accumulator;
  }, {});
}
// 查询当前视图的所有字段
const searchViewsFields = async () => {
  const queryData = {
    operation: 'query_views_fields',
    query: `SHOW COLUMNS FROM \`${state.selectedNowView}\`;`
  };
  // 发送查询所有表的请求
  await store.dispatch('websocket/executeQuery', queryData)
}

const handleCheckAllChange = (val: any) => {
  state.checkedViews = val ? state.allViews : []
  state.isIndeterminate = false
  for (let key in state.views) {
    state.views[key].isSelected = val
  }
}

// 表单选
const handleCheckedTablesChange = async (value: string[]) => {
  const checkedCount = value.length // 选中的个数
  state.isCheckAll = checkedCount === state.allViews.length // 当前选中个数 是否等于总长度
  state.isIndeterminate = checkedCount > 0 && checkedCount < state.allViews.length // 当前选中个数 是否大于0 小于总长度
  state.selectedNowView = value[value.length - 1] // 当前选中是数组的最后一个
  saveConfig()
  searchViewsFields()
}
const handleCheckedEncipherFieldsChange = (value: any) => {
  console.log(value)
}


const handlePrev = () => {
  store.dispatch('stepMark/setActiveStep', 2)
  router.push({ name: 'step2', params: {} })
}

const handleNext = () => {
  store.dispatch('stepMark/setActiveStep', 4)
  saveConfig()
  router.push({ name: 'step4', params: {} })
}


const saveConfig = async () => {
  // 创建一个新的对象，只包含需要修改的属性
  const updatedConfig = {
    selectedViews: state.checkedViews,
    views: state.views,
  }
  const newDataConfigLocal = {
    ...Session.get('Config'),
    ...updatedConfig,
  };
  Session.set('Config', newDataConfigLocal)
}

</script>