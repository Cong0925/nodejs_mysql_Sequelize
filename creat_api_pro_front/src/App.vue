<template>
  <div style="width: 100%;display: flex; flex-direction: column; ">
    <div class="header" style="height: 100px;">
      <el-steps style="max-width: 1200px;margin:0 auto;" :active="state.activeStep" align-center>
        <el-step title="准备" :icon="Loading" />
        <el-step title="数据库连接" :icon="Coin" />
        <el-step title="表设置" :icon="Document" />
        <el-step title="视图设置" :icon="Files" />
        <el-step title="信息确认" :icon="DocumentChecked" />
        <el-step title="生成中" :icon="Printer" />
        <el-step title="完成" :icon="CircleCheck" />
      </el-steps>
    </div>
    <div class="main" style="min-height: calc(100vh - 200px); ">
      <router-view></router-view>
      <FloatBall />  <!-- 放这里就全局显示 -->
    </div>
    <!-- <div class="footer" style="height: 100px;">

    </div> -->
  </div>
</template>

<script lang="ts" setup>
import FloatBall from './components/FloatBall.vue'
import { Coin,  Document, Loading,Files,CircleCheck,Printer,DocumentChecked } from '@element-plus/icons-vue'
import { reactive, watch } from 'vue';
import { useStore } from 'vuex';
const store = useStore()
const state = reactive({
  activeStep: store.getters.getActiveStep || 1,
})

watch(() => store.getters.getActiveStep, (newVal) => {
  
  if(newVal >0 && newVal <=7 ){
    state.activeStep = newVal
  }
})

</script>

<style scoped></style>