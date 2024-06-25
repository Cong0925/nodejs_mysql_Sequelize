<template>
  <el-card style="margin-top: 20px;">
    <el-tabs v-model="state.tabActivited" class="demo-tabs" @tab-click="handleClick">
      <el-tab-pane label="表" name="Tables">
        <el-table :data="state.selectedTables" style="width: 100%">
          <el-table-column prop="name" label="表名" width="300" />
          <el-table-column prop="encipherField" label="加密字段">
            <template #default="scope">
              <div v-for="item in scope.row.encipherField">
                {{ item }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="logicDelField" label="逻辑删除字段" width="180" />
          <el-table-column prop="primaryKeyField" label="业务主键" width="180" />
          <el-table-column prop="primaryKeyFieldRule" label="业务主键生成规则" width="180" />
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="视图" name="Views">
        <el-table :data="state.selectedViews" style="width: 100%">
          <el-table-column prop="name" label="视图名" width="250" />
          <el-table-column prop="toSearchFields" label="接口查询字段" >
            <template #default="scope">
              <span v-for="item in scope.row.toSearchFields" style="margin-left: 10px;">
                {{ item }},
              </span>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <div style="margin: 10px;display: flex;justify-content: end;">
      <el-button type="primary" @click="handlePrev">上一步</el-button>
      <el-button type="primary" @click="handleNext">下一步</el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import type { TabsPaneContext } from 'element-plus'
import { FieldState } from '@/interface';
import router from '@/router';
import { useStore } from 'vuex';
import { Session } from '@/utils/cookieSet';
const store = useStore();

interface State {
  tabActivited: string,
  selectedTables: Array<{
    isSelected: boolean, //当前表是否选中
    name: string,  //表名
    logicDelField: string,   //逻辑删除字段
    primaryKeyField: string,   //主键字段
    primaryKeyFieldRule: string, //主键字段规则
    encipherField: Array<string>  //加密字段
    fields: Array<FieldState>,
  }>
  selectedViews: Array<{
    isSelected: boolean
    name: string
    toSearchFields: Array<string>
    fields: Array<FieldState>
  }>
}

const state: State = reactive({
  tabActivited: 'Tables',
  selectedTables: [],
  selectedViews: []
})

const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event)
}

onMounted(() => {
  let tables = Session.get('Config').tables
  for (let key in tables) {
    if (tables[key].isSelected) {
      state.selectedTables.push(tables[key])
    }
  }
  let views = Session.get('Config').views
  console.log('views',Session.get('Config').views)
  for (let key in views) {
    if (views[key].isSelected) {
      state.selectedViews.push(views[key])
    }
  }
})

// 上一步
const handlePrev = () => {
  store.dispatch('stepMark/setActiveStep', 3)
  router.push({ name: 'step3', params: {} })
}
// 下一步
const handleNext = () => {
  store.dispatch('stepMark/setActiveStep', 5)
  saveConfig()
  router.push({ name: 'step5', params: {} })
}
const saveConfig = () => {

}
</script>

<style scoped>
:deep(.el-tabs__item) {
  font-size: 22px;
}
</style>