<template>
  <el-card style="margin-top: 20px;">
    <!-- 左侧菜单 -->
    <div style="display: flex; justify-content: space-between;">
      <el-affix :offset="20" style="width:200px">
        <div class="sider" style="flex: 1;">
          <el-card class="table-card" :style="{ minHeight: cardMinHeight + 'px' }">
            <!-- 搜索输入框 -->
            <el-autocomplete v-model="searchQuery" :fetch-suggestions="querySearch" placeholder="输入表名进行搜索"
              @select="handleSelect" clearable style="width: 100%; margin-bottom: 10px;"></el-autocomplete>

            <div style="display: flex; flex-direction: column; flex-shrink: 0;">
              <el-checkbox v-model="state.isCheckAll" :indeterminate="state.isIndeterminate"
                @change="handleCheckAllChange">
                全选({{ state.checkedTables.length }}/{{ state.allTables.length }})
              </el-checkbox>
            </div>

            <!-- 动态设置最大高度的滚动容器 -->
            <div ref="scrollContainerRef" class="checkbox-scroll-container"
              :style="{ maxHeight: scrollMaxHeight + 'px' }" style="flex: 1; overflow-y: auto;">
              <el-checkbox-group v-model="state.checkedTables" @change="handleCheckedTablesChange"
                style="display: flex; flex-direction: column">
                <div v-for="(_value, key) in state.tables" :key="key" :id="`table-item-${key}`">
                  <el-checkbox :label="key" :value="key" size="large"
                    :class="{ 'now-actived': state.selectedNowTable === key }" class="table-checkbox-item"
                    @click.prevent.stop="handleTableClick(key)">
                    <span class="checkbox-text" :title="key">
                      {{ key }}
                    </span>
                  </el-checkbox>
                </div>
              </el-checkbox-group>
            </div>
          </el-card>
        </div>
      </el-affix>

      <!-- 右侧配置 -->
      <div class="table-main" style="flex: 3; margin-left: 20px; ">
        <div style="box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);padding: 10px;">
          <div style="margin: 10px;">
            <span style="font-size: 24px;font-weight: bold;">当前表：{{ state.selectedNowTable || '未选择' }}</span>
          </div>

          <!-- 未选择表时的提示 -->
          <el-empty v-if="!state.selectedNowTable || !state.tables[state.selectedNowTable]" description="请选择一个表" />

          <!-- 已选择表时显示配置卡片 -->
          <template v-else>
            <!-- ... 卡片内容不变 ... -->
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
                  <div class="font14 left color-gray margin-top10">
                    <span>目前暂不支持除下述以外的命名方式确认逻辑删除字段</span>
                  </div>
                  <div class="left">
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
                    @change="handleCheckedEncipherFieldsChange" style="display: flex;flex-wrap: wrap;">
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
          </template>

          <!-- ========== 按钮区域修改 ========== -->
          <div style="margin: 10px;display: flex;justify-content: end;">
            <!-- 无参数时显示两个按钮 -->
            <template v-if="!isFromSummary">
              <el-button type="primary" @click="handlePrev">上一步</el-button>
              <el-button type="primary" @click="handleNext">下一步</el-button>
            </template>
            <!-- 有参数时只显示返回按钮 -->
            <template v-else>
              <el-button type="primary" @click="handleSaveAndBackToSummary">保存并返回</el-button>
              <el-button type="primary" @click="handleBackToSummary">返回</el-button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { FieldState } from '@/interface';
import router from '@/router';
import { Session } from '@/utils/cookieSet';
import { onMounted, onUnmounted, reactive, ref, watch, nextTick, computed } from 'vue'; // 新增 computed
import CONFIG from '@/config/index'
import { useStore } from 'vuex';
import { findMostSimilarWithId } from '@/utils/differ'
import { useRoute } from 'vue-router';

const store = useStore();
const route = useRoute();

// 新增：判断是否从汇总页跳转过来（携带 table 参数）
const isFromSummary = computed(() => !!route.query.table);

interface State {
  isCheckAll: boolean
  isIndeterminate: boolean
  primaryKeyFieldRules: Array<string>
  tables: {
    [key: string]: {
      isSelected: boolean
      name: string
      logicDelField: string
      primaryKeyField: string
      primaryKeyFieldRule: string
      encipherField: Array<string>
      fields: Array<FieldState>
    }
  }
  checkedTables: Array<string>
  allTables: Array<string>
  selectedNowTable: string
}

const state: State = reactive({
  isCheckAll: false,
  isIndeterminate: true,
  primaryKeyFieldRules: ['规则一', '规则二', '规则三'],
  tables: {
    defaultTable: {
      isSelected: false,
      name: 'defaultTable',
      logicDelField: '',
      primaryKeyField: '',
      primaryKeyFieldRule: '',
      encipherField: [],
      fields: [{
        Default: '',
        Extra: '',
        Field: 'defaultField',
        Key: '',
        Null: '',
        Type: '',
      }],
    }
  },
  checkedTables: ['defaultTable'],
  allTables: [],
  selectedNowTable: 'defaultTable',
})

const scrollContainerRef = ref<HTMLElement | null>(null);
const searchQuery = ref('');

const querySearch = (queryString: string, cb: Function) => {
  if (!queryString) {
    cb([]);
    return;
  }
  const results = state.allTables.filter(item =>
    item.toLowerCase().includes(queryString.toLowerCase())
  );
  cb(results.map(item => ({ value: item })));
};

const handleSelect = (item: { value: string }) => {
  const tableName = item.value;
  scrollToView(tableName);
  if (state.selectedNowTable !== tableName) {
    if (!state.checkedTables.includes(tableName)) {
      state.checkedTables.push(tableName);
    }
    state.selectedNowTable = tableName;
    if (!state.tables[tableName]?.fields?.length) {
      searchTableFields(state.selectedNowTable);
    }
  }
  searchQuery.value = '';
};

const scrollToView = (tableName: string) => {
  const targetElement = document.getElementById(`table-item-${tableName}`);
  const container = scrollContainerRef.value;
  if (targetElement && container) {
    const containerRect = container.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    const offsetTop = targetRect.top - containerRect.top + container.scrollTop;
    container.scrollTo({ top: offsetTop, behavior: 'smooth' });
  }
};

watch(() => state.checkedTables, (newVal, oldVal) => {
  if (newVal.length < oldVal.length) {
    const removed = oldVal.filter((item: string) => !newVal.includes(item));
    removed.forEach((item: string) => {
      if (state.tables[item]) state.tables[item].isSelected = false;
    });
  }
});

const solveBackMsg = async () => {
  const data = store.getters.getMessage;
  if (data.error) {
    console.error(data.error);
  } else if (data.code === '2000') {
    if (data.type === 'query_tables') {
      state.allTables = data.results.map((item: any) => item[`Tables_in_${Session.get('connectionInfo').database}`]);
      state.allTables = state.allTables.filter(item => item !== 'user_token');
      state.checkedTables = [state.allTables[0]];
      state.selectedNowTable = state.allTables[0];
      await initTables();
      state.tables[state.selectedNowTable].isSelected = true;
      searchTableFields(state.selectedNowTable);
      handleRouteQuery();
    }
    if (data.type === 'query_table_fields') {
      if (state.tables[data.curVal]) {
        state.tables[data.curVal].fields = data.results;
        state.tables[data.curVal].isSelected = true;
        state.tables[data.curVal].primaryKeyField = findMostSimilarWithId(data.curVal, data.results.map((item: any) => item.Field));
        state.tables[data.curVal].primaryKeyFieldRule = data.results.find((item: any) => item.Key !== '')?.Extra === CONFIG.primaryKeyFieldRules[0] ? CONFIG.primaryKeyFieldRules[0] : '';
        state.tables[data.curVal].logicDelField = data.results.find((item: any) => CONFIG.logicalDelFieldOptions.includes(item.Field))?.Field;
      }
    }
  } else if (data.code === '2001') {
    console.log('数据库连接错误，检查参数');
  }
};
watch(() => store.getters.getMessage, solveBackMsg);

const handleRouteQuery = async () => {
  const targetTable = route.query.table as string;
  if (targetTable && state.allTables.includes(targetTable)) {
    if (!state.checkedTables.includes(targetTable)) {
      state.checkedTables.push(targetTable);
    }
    state.selectedNowTable = targetTable;
    if (!state.tables[targetTable]?.fields?.length) {
      await searchTableFields(state.selectedNowTable);
    }
    await nextTick();
    scrollToView(targetTable);
  }
};

onMounted(async () => {
  if (Object.keys(Session.get('Config').tables || {}).length === 0) {
    await store.dispatch('websocket/executeQuery', {
      operation: 'query_tables',
      query: "show full tables where Table_type = 'BASE TABLE';"
    });
  } else {
    state.tables = Session.get('Config').tables;
    state.checkedTables = Session.get('Config').selectedTables || [];
    state.allTables = Object.keys(Session.get('Config').tables);
    state.selectedNowTable = state.allTables[0] || '';
    if (state.selectedNowTable && !state.tables[state.selectedNowTable]?.fields?.length) {
      searchTableFields(state.selectedNowTable);
    }
    await nextTick();
    handleRouteQuery();
  }
  calculateHeight();
  window.addEventListener('resize', handleUpdate);
  window.addEventListener('scroll', handleUpdate);
  const affixElement = document.querySelector('.el-affix');
  if (affixElement) {
    const resizeObserver = new ResizeObserver(handleUpdate);
    resizeObserver.observe(affixElement);
    onUnmounted(() => resizeObserver.disconnect());
  }
});

const initTables = () => {
  state.tables = state.allTables.reduce((acc: any, cur: string) => {
    acc[cur] = {
      isSelected: false,
      name: cur,
      logicDelField: '',
      primaryKeyField: '',
      primaryKeyFieldRule: '',
      encipherField: [],
      fields: [],
    };
    return acc;
  }, {});
};

// 全选
const handleCheckAllChange = async (val: boolean) => {
  state.checkedTables = val ? [...state.allTables] : [];
  state.isIndeterminate = false;
  if (val && state.allTables.length) {
      state.selectedNowTable = state.allTables[0];
    for(const key in state.tables) {
      state.tables[key].isSelected = val;
      if (!state.tables[key]?.fields?.length) {
        searchTableFields(key);
      }
    }
  } else {
    state.selectedNowTable = '';
  }
};

const handleCheckedTablesChange = async (value: string[]) => {
  const checkedCount = value.length;
  state.isCheckAll = checkedCount === state.allTables.length;
  state.isIndeterminate = checkedCount > 0 && checkedCount < state.allTables.length;
  if (value.length) {
    state.selectedNowTable = value[value.length - 1];
    if (!state.tables[state.selectedNowTable]?.fields?.length) {
      searchTableFields(state.selectedNowTable);
    }
  } else {
    state.selectedNowTable = '';
  }
  saveConfig();
};

const handleTableClick = (key: string) => {
  if (state.selectedNowTable === key) {
    state.checkedTables = state.checkedTables.filter(item => item !== key);
    state.selectedNowTable = '';
  } else {
    if (!state.checkedTables.includes(key)) {
      state.checkedTables.push(key);
    }
    state.selectedNowTable = key;
    if (!state.tables[key]?.fields?.length) {
      searchTableFields(state.selectedNowTable);
    }
  }
};

const handleCheckedEncipherFieldsChange = (value: string[]) => {
  console.log(value);
};

const searchTableFields = async (key:any) => {
  if (!key) return;
  await store.dispatch('websocket/executeQuery', {
    operation: 'query_table_fields',
    query: `SHOW COLUMNS FROM \`${key}\`;`,
    curVal: key
  });
};

// 上一步：如果有参数则返回 step4（汇总页），否则返回 step1
const handlePrev = () => {
  if (isFromSummary.value) {
    store.dispatch('stepMark/setActiveStep', 4);
    router.push({ name: 'step4' });
  } else {
    store.dispatch('stepMark/setActiveStep', 1);
    router.push({ name: 'step1' });
  }
};

// 下一步（仅在无参数时使用）
const handleNext = () => {
  store.dispatch('stepMark/setActiveStep', 3);
  saveConfig();
  router.push({ name: 'step3' });
};

// 保存并返回汇总页
const handleSaveAndBackToSummary = () => {
  store.dispatch('stepMark/setActiveStep', 4);
  saveConfig();
  router.push({ name: 'step4' });
};

// 返回汇总页
const handleBackToSummary = () => {
  store.dispatch('stepMark/setActiveStep', 4);
  router.push({ name: 'step4' });
};

// 保存当前配置
const saveConfig = () => {
  const updatedConfig = {
    selectedTables: state.checkedTables,
    tables: state.tables
  };
  Session.set('Config', { ...Session.get('Config'), ...updatedConfig });
};

const cardMinHeight = ref(500);
const scrollMaxHeight = ref(500);
let ticking = false;

const calculateHeight = () => {
  const affixElement = document.querySelector('.el-affix');
  if (!affixElement) return;
  const rect = affixElement.getBoundingClientRect();
  const availableHeight = window.innerHeight - rect.top - 70;
  scrollMaxHeight.value = Math.max(100, Math.min(availableHeight - 60, 500));
  cardMinHeight.value = Math.min(availableHeight - 30, 500);
};

const handleUpdate = () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      calculateHeight();
      ticking = false;
    });
    ticking = true;
  }
};

let resizeObserver: ResizeObserver | null = null;
onMounted(() => {
  resizeObserver = new ResizeObserver(handleUpdate);
  const affixElement = document.querySelector('.el-affix');
  if (affixElement) resizeObserver.observe(affixElement);
});
onUnmounted(() => {
  window.removeEventListener('resize', handleUpdate);
  window.removeEventListener('scroll', handleUpdate);
  if (resizeObserver) resizeObserver.disconnect();
});
</script>

<style scoped>

</style>