<template>
  <div style="width: 450px;height: 500px;margin: 0 auto;">
    <el-container style="">
      <el-header>
        <div style="font-size: 36px;">
          数据库连接
        </div>
      </el-header>
      <el-main>
        <el-form @submit.prevent="connectToDatabase">
          <el-form-item label="Host:">
            <el-input v-model="state.connectionInfo.host" placeholder="请输入主机地址"></el-input>
          </el-form-item>
          <el-form-item label="Port:">
            <el-input v-model="state.connectionInfo.port" placeholder="请输入端口"></el-input>
          </el-form-item>
          <el-form-item label="User:">
            <el-input v-model="state.connectionInfo.user" placeholder="请输入用户名"></el-input>
          </el-form-item>
          <el-form-item label="Password:">
            <el-input type="password" v-model="state.connectionInfo.password" placeholder="请输入密码"
              show-password></el-input>
          </el-form-item>
          <!-- <el-form-item label="Database:">
            <el-input v-model="state.connectionInfo.database" placeholder="请输入数据库名"></el-input>
          </el-form-item> -->
          <el-form-item>
            <el-button style="margin: 0 auto;" type="primary" @click="connectToDatabase">连接数据库</el-button>
          </el-form-item>
        </el-form>
        <br>
        <div>
          <p style="margin: 0;"
            :class="{ 'success-message': state.sqlDatabases.length > 0, 'error-message': state.sqlDatabases.length === 0 }">
            {{ state.sqlDatabases.length > 0 ? '连接成功' : '未连接' }}
          </p>
          <el-select v-model="state.selectedDatabase" placeholder="选择数据库" size="large" style="width: 240px">
            <el-option v-for="item in state.sqlDatabases" :key="item.Database" :label="item.Database"
              :value="item.Database" />
          </el-select>
        </div>
        <div style="margin: 10px auto;">
          <el-button type="primary" @click="nextStep" :disabled="state.selectedDatabase === ''">下一步</el-button>
        </div>
      </el-main>
    </el-container>
  </div>

</template>

<script setup lang="ts">
import router from '@/router';
import { reactive, watch } from 'vue';
import CONFIG from "@/config/index"
import { useStore } from 'vuex';
const store = useStore();
import { defaultDataState, SqlDatabasesState } from "@/interface/index"
import { Session } from '@/utils/cookieSet';

interface State {
  connectionInfo: defaultDataState
  sqlDatabases: Array<SqlDatabasesState>
  selectedDatabase: string
}
const state: State = reactive({
  connectionInfo: {
    ...CONFIG.defaultData
  },
  sqlDatabases: [],
  selectedDatabase: '',
})
// 建立ws连接
const connectToDatabase = async () => {
  // 数据库连接参数
  const connectionData = {
    operation: 'connect',
    connectionInfo: state.connectionInfo
  };
  try {
    // 调用vuex上的连接方法
    await store.dispatch('websocket/connect', { connectionData })
  } catch (error) {
    console.log(error)
  }
}
// 监听返回值
watch(() => store.getters.getMessage, (_newVal: any) => {
  // console.log('message', store.getters.getMessage, newVal)
  solveBackMsg()
})
// 监听数据库的选择
watch(() => state.selectedDatabase, (_newVal: any) => {
  // 保存临时信息
  state.connectionInfo.database = state.selectedDatabase;
  Session.set('connectionInfo', state.connectionInfo)
})

// 消息处理函数
const solveBackMsg = async () => {
  let data = store.getters.getMessage
  if (data.error) {
    console.error(data.error);
  } else if (data.code === '2000') {
    if (data.type === 'connect') {
      // 构建要发送的查询数据
      const queryData = {
        operation: 'query_database',
        query: 'SHOW DATABASES;'
      };
      await store.dispatch('websocket/executeQuery', queryData)
      // console.log('message', store.getters.getMessage)
    }
    if (data.type === 'query_database') {
      // 如果是查询结果，则将其显示在页面上      
      const results = data.results;
      state.sqlDatabases = results
      // console.log(state.sqlDatabases);
    }

  } else if (data.code === '2001') {
    console.log('数据库连接错误，检查参数')
  }
}

// 下一步
const nextStep = async () => {
  // 更新步骤
  await connectToDatabase()
  if (state.selectedDatabase !== Session.get('connectionInfo').database) {
    // 清除缓存配置
    Session.remove('Config')
  }
  // 保存配置
  saveConfig()
  store.dispatch('stepMark/setActiveStep', 2)
  router.push({ name: 'step2', params: {} })
}

// 存储当前配置到config中
const saveConfig = async () => {
  // 创建一个新的对象，只包含需要修改的属性
  const updatedConfig = {
    ...state.connectionInfo,
    database: state.selectedDatabase
  }
  const newDataConfigLocal = {
    ...store.getters.getDataConfigLocal,
    ...updatedConfig,
  };
  Session.set('Config', newDataConfigLocal)
}

</script>

<style scoped>
.success-message {
  color: green
}

.error-message {
  color: red
}
</style>