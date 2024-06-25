<template>
  <el-card style="margin-top: 20px;">
    <template #header>
      <div class="card-header">
        <span style="font-weight: bold;font-size: larger;">生成路径</span>
      </div>
    </template>
    <div style="display: flex;margin-bottom: 20px;">
      <div>
        <div style="display: flex;font-weight: bold;margin: 10px 0;font-size: medium;">目标生成路径</div>
        <div style="display: flex;">
          <el-input v-model="state.outPath" style="width: 240px" disabled placeholder="creat_api_pro_server/dist/" />
        </div>
      </div>
      <div>
        <div style="display: flex;font-weight: bold;margin: 10px 0;font-size: medium;">目标项目名</div>
        <div style="display: flex;">
          <el-input v-model="state.projectName" style="width: 240px" placeholder="输入项目名称" />
          <el-button type="primary" @click="saveConfig">保存</el-button>
        </div>
      </div>
    </div>

    <data value="">
      <el-input v-model="state.log" style="width: 1200px;margin:10px auto" :rows="25" type="textarea"
        placeholder="Please input" disabled />
    </data>

    <div style="margin: 10px;display: flex;justify-content: end;">
      <el-button type="primary" @click="handlePrev">上一步</el-button>
      <el-button type="primary" @click="handleNext" :disabled="state.isCreated">{{ state.isCreated === true ? '完成' :
        '开始'
        }}</el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import router from '@/router';
import { Session } from '@/utils/cookieSet';
import { ElMessage } from 'element-plus';
import { reactive, watch } from 'vue';
import { useStore } from 'vuex';
const store = useStore();

interface State {
  outPath: string
  projectName: string
  log: string
  isCreated: boolean
  timeoutId: any
}

const state: State = reactive({
  outPath: 'creat_api_pro_server/dist/',
  projectName: 'api_1_0',
  log: '点击开始 按钮开始生成项目\n',
  timeoutId: null,
  isCreated: false
})

// 监听返回值
watch(() => store.getters.getMessage, (_newVal: any) => {
  // console.log('message', store.getters.getMessage, newVal)
  solveBackMsg()
})

// 消息处理函数
const solveBackMsg = async () => {
  let data = store.getters.getMessage
  // 如果传入的 timeoutId 已经存在，先清除它
  if (state.timeoutId) {
    clearTimeout(state.timeoutId);
  }

  if (data.error) {
    state.log += '\n' + '-----  ERROR  -----' + '\n' + data.error
    console.error(data.error);
  } else if (data.code === '2000') {
    if (data.type === 'creating') {
      state.log += data.results + '\n'
    }
    state.timeoutId = setTimeout(() => {
      state.log += '\n' + '-----  END  -----' + '\n\n\n\n\n\n\n'
      state.isCreated = true
      store.dispatch('stepMark/setActiveStep', 7)

    }, 2000);
  } else if (data.code === '2001') {
    state.log += '\n' + data.results + '\n'
    console.log('数据库连接错误，检查参数')
  } else if (data.code === '2003') {
    state.log += '\n' + data.results + '\n'
    console.log('文件写入错误，检查日志')
  }
}

// 上一步
const handlePrev = () => {
  store.dispatch('stepMark/setActiveStep', 4)
  router.push({ name: 'step4', params: {} })
}

// 保存配置
const saveConfig = async () => {
  // 创建一个新的对象，只包含需要修改的属性
  const updatedConfig = {
    projectName: state.projectName,
  }
  const newDataConfigLocal = {
    ...Session.get('Config'),
    ...updatedConfig,
  };
  Session.set('Config', newDataConfigLocal);
}
// 生成
const handleNext = async () => {
  if (Session.get('Config').projectName === '') {
    ElMessage({
      showClose: true,
      message: '请输入项目名称 并保存',
      type: 'error',
    })
  } else {
    const Data = {
      operation: 'creating',
      query: Session.get('Config')
    }
    await store.dispatch('websocket/executeQuery', Data)
    state.log += '\n' + '-----  BEGINING  -----' + '\n'

  }
}
</script>