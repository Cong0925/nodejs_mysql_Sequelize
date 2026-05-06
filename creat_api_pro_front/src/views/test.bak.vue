<template>
    <div style="width: 450px;height: 500px;margin: 0 auto;">
        <el-container>
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
                    <el-form-item>
                        <el-button style="margin: 0 auto;" type="primary" :loading="isConnecting"
                            :disabled="isConnecting" @click="connectToDatabase">
                            连接数据库
                        </el-button>
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
                    <el-button type="primary" @click="nextStep"
                        :disabled="state.selectedDatabase === '' || state.sqlDatabases.length === 0">下一步</el-button>
                </div>
            </el-main>
        </el-container>
    </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import router from '@/router';
import { reactive, watch, ref } from 'vue';
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

const isConnecting = ref(false);

// 建立ws连接（仅用于用户点击“连接数据库”按钮）
const connectToDatabase = async () => {
    if (isConnecting.value) return;

    isConnecting.value = true;
    const connectionData = {
        operation: 'connect',
        connectionInfo: state.connectionInfo
    };
    try {
        await store.dispatch('websocket/connect', { connectionData });
        // 注意：成功后的状态在 solveBackMsg 中重置（收到数据库列表后）
    } catch (error) {
        console.error(error);
        ElMessage.error('连接请求失败，请检查网络');
        isConnecting.value = false;
    }
};

// 监听返回值
watch(() => store.getters.getMessage, (_newVal: any) => {
    solveBackMsg();
});

// 监听数据库的选择
watch(() => state.selectedDatabase, (_newVal: any) => {
    state.connectionInfo.database = state.selectedDatabase;
    Session.set('connectionInfo', state.connectionInfo);
});

// 消息处理函数
const solveBackMsg = async () => {
    let data = store.getters.getMessage;
    if (data.error) {
        console.error(data.error);
        isConnecting.value = false;
        ElMessage.error(data.error);
    } else if (data.code === '2000') {
        if (data.type === 'connect') {
            // 连接成功，继续查询数据库列表
            const queryData = {
                operation: 'query_database',
                query: 'SHOW DATABASES;'
            };
            await store.dispatch('websocket/executeQuery', queryData);
        }
        if (data.type === 'query_database') {
            state.sqlDatabases = data.results;
            // 数据库列表获取完成，重置连接按钮状态
            isConnecting.value = false;
        }
    } else if (data.code === '2001') {
        console.log('数据库连接错误，检查参数');
        isConnecting.value = false;
        ElMessage.error('数据库连接错误，请检查参数');
    }
};

// 下一步
const nextStep = async () => {
    // 必须先成功连接并选择数据库
    if (state.sqlDatabases.length === 0) {
        ElMessage.warning('请先连接数据库');
        return;
    }
    if (!state.selectedDatabase) {
        ElMessage.warning('请选择数据库');
        return;
    }

    // 更新连接信息中的数据库名
    state.connectionInfo.database = state.selectedDatabase;

    // 如果切换了数据库，清除旧配置缓存
    const savedInfo = Session.get('connectionInfo');
    if (!savedInfo || state.selectedDatabase !== savedInfo.database) {
        Session.remove('Config');
    }

    // 保存当前连接信息到 Session
    Session.set('connectionInfo', state.connectionInfo);
    saveConfig();

    store.dispatch('stepMark/setActiveStep', 2);
    router.push({ name: 'step2' });
};

// 存储当前配置到config中
const saveConfig = () => {
    const updatedConfig = {
        ...state.connectionInfo,
        database: state.selectedDatabase
    };
    const existing = Session.get('Config') || {};
    Session.set('Config', { ...existing, ...updatedConfig });
};
</script>

<style scoped>
.success-message {
    color: green
}

.error-message {
    color: red
}
</style>