<template>
  <el-card style="margin-top: 20px;">
    <el-tabs v-model="state.tabActivited" class="demo-tabs" @tab-click="handleClick">
      <!-- 表 Tab -->
      <el-tab-pane label="表" name="Tables">
        <div class="table-header">
          <span class="total-count">总数：{{ state.selectedTables.length }} 个</span>
        </div>
        <!-- 表格 -->
        <el-table :data="tablePageData" style="width: 100%" class="custom-table" stripe border>
          <el-table-column label="序号" width="60" type="index" :index="tableStartIndex" align="center" />
          <el-table-column prop="name" label="表名" min-width="220" show-overflow-tooltip>
            <template #default="scope">
              <el-link type="primary" :underline="false" @click="goToTableConfig(scope.row.name)">
                {{ scope.row.name }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column prop="encipherField" label="加密字段" min-width="180">
            <template #default="scope">
              <div class="multi-line-cell">
                <span v-for="(item, index) in scope.row.encipherField" :key="index" class="cell-tag">
                  {{ item }}
                </span>
                <span v-if="!scope.row.encipherField?.length" class="empty-text">-</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="logicDelField" label="逻辑删除字段" width="160">
            <template #default="scope">
              <span v-if="scope.row.logicDelField" class="field-tag">
                {{ scope.row.logicDelField }}
              </span>
              <span v-else class="empty-text">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="primaryKeyField" label="业务主键" width="140">
            <template #default="scope">
              <span v-if="scope.row.primaryKeyField" class="field-tag">
                {{ scope.row.primaryKeyField }}
              </span>
              <span v-else class="empty-text">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="primaryKeyFieldRule" label="业务主键生成规则" width="180">
            <template #default="scope">
              <el-tag type="primary" size="small" effect="plain">
                {{ scope.row.primaryKeyFieldRule || '-' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <!-- 表 分页 -->
        <div class="pagination-container" v-if="state.selectedTables.length > 0">
          <el-pagination v-model:current-page="tablePage.currentPage" v-model:page-size="tablePage.pageSize"
            :page-sizes="state.tablePageSize" :total="state.selectedTables.length"
            layout="total, sizes, prev, pager, next, jumper" background @size-change="handleTableSizeChange"
            @current-change="handleTableCurrentChange" />
        </div>
      </el-tab-pane>

      <!-- 视图 Tab -->
      <el-tab-pane label="视图" name="Views">
        <div class="table-header">
          <span class="total-count">总数：{{ state.selectedViews.length }} 个</span>
        </div>
        <!-- 视图表格 -->
        <el-table :data="viewPageData" style="width: 100%" class="custom-table" stripe border>
          <el-table-column label="序号" width="60" type="index" :index="viewStartIndex" align="center" />
          <el-table-column prop="name" label="视图名" min-width="220" show-overflow-tooltip>
            <template #default="scope">
              <el-link type="primary" :underline="false" @click="goToViewConfig(scope.row.name)">
                {{ scope.row.name }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column prop="toSearchFields" label="接口查询字段" min-width="200">
            <template #default="scope">
              <div class="multi-line-cell">
                <span v-for="(item, index) in scope.row.toSearchFields" :key="index" class="cell-tag">
                  {{ item }}
                </span>
                <span v-if="!scope.row.toSearchFields?.length" class="empty-text">-</span>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <!-- 视图 分页 -->
        <div class="pagination-container" v-if="state.selectedViews.length > 0">
          <el-pagination v-model:current-page="viewPage.currentPage" v-model:page-size="viewPage.pageSize"
            :page-sizes="state.tablePageSize" :total="state.selectedViews.length"
            layout="total, sizes, prev, pager, next, jumper" background @size-change="handleViewSizeChange"
            @current-change="handleViewCurrentChange" />
        </div>
      </el-tab-pane>
    </el-tabs>

    <div style="margin: 10px;display: flex;justify-content: end;">
      <el-button type="primary" @click="handlePrev">上一步</el-button>
      <el-button type="primary" @click="handleNext">下一步</el-button>
    </div>
  </el-card>
  <BackToTop />
</template>

<script setup lang="ts">
import BackToTop from '@/components/BackToTop.vue'
import { onMounted, reactive, computed } from 'vue'
import type { TabsPaneContext } from 'element-plus'
import { FieldState } from '@/interface';
import router from '@/router';
import { useStore } from 'vuex';
import { Session } from '@/utils/cookieSet';

const store = useStore();

interface State {
  tabActivited: string,
  tablePageSize: Array<number>,
  selectedTables: Array<{
    isSelected: boolean,
    name: string,
    logicDelField: string,
    primaryKeyField: string,
    primaryKeyFieldRule: string,
    encipherField: Array<string>
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
  tablePageSize: [10, 20, 50, 100],
  tabActivited: 'Tables',
  selectedTables: [],
  selectedViews: []
})

// ==================== 表 分页 ====================
const tablePage = reactive({
  currentPage: 1,
  pageSize: 10
})
const tablePageData = computed(() => {
  const start = (tablePage.currentPage - 1) * tablePage.pageSize
  const end = start + tablePage.pageSize
  return state.selectedTables.slice(start, end)
})
const tableStartIndex = computed(() => {
  return (tablePage.currentPage - 1) * tablePage.pageSize + 1
})
const handleTableSizeChange = () => {
  tablePage.currentPage = 1
}
const handleTableCurrentChange = () => { }

// ==================== 视图 分页 ====================
const viewPage = reactive({
  currentPage: 1,
  pageSize: 10
})
const viewPageData = computed(() => {
  const start = (viewPage.currentPage - 1) * viewPage.pageSize
  const end = start + viewPage.pageSize
  return state.selectedViews.slice(start, end)
})
const viewStartIndex = computed(() => {
  return (viewPage.currentPage - 1) * viewPage.pageSize + 1
})
const handleViewSizeChange = () => {
  viewPage.currentPage = 1
}
const handleViewCurrentChange = () => { }

const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event)
}

// 跳转到表配置页面（step2）
const goToTableConfig = (tableName: string) => {
  // 保存当前选中的表名到 session 或路由参数，以便 step2 自动选中
  // 此处使用 query 参数传递
  store.dispatch('stepMark/setActiveStep', 2)
  router.push({
    name: 'step2',
    query: { table: tableName }
  })
}

// 跳转到视图配置页面（step3）
const goToViewConfig = (viewName: string) => {
  store.dispatch('stepMark/setActiveStep', 3)
  router.push({
    name: 'step3',
    query: { view: viewName }
  })
}

onMounted(() => {
  let config = Session.get('Config')
  let tables = config.tables || {}
  for (let key in tables) {
    if (tables[key].isSelected) {
      state.selectedTables.push(tables[key])
    }
  }
  let views = config.views || {}
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
const saveConfig = () => { }
</script>

<style scoped>
:deep(.el-tabs__item) {
  font-size: 22px;
}

.demo-tabs {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 12px;
}

.table-header {
  padding: 8px 0 12px 4px;
  display: flex;
  align-items: center;
}

.total-count {
  font-size: 13px;
  color: #606266;
}

.custom-table {
  font-size: 13px;
}

.multi-line-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.cell-tag {
  display: inline-block;
  padding: 2px 8px;
  background: #f0f7ff;
  color: #409eff;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.5;
}

.field-tag {
  color: #303133;
  font-size: 13px;
}

.empty-text {
  color: #c0c4cc;
  font-size: 13px;
}

/* 分页样式 */
.pagination-container {
  margin-top: 15px;
  display: flex;
  justify-content: end;
}
</style>