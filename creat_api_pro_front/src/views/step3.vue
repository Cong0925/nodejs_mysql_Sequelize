<template>
  <el-card style="margin-top: 20px;">
    <div style="display: flex; justify-content: space-between;">
      <!-- 左侧固钉 + 滚动视图列表 -->
      <el-affix :offset="20" style="width:200px">
        <div class="sider" style="flex: 1;">
          <el-card class="table-card" :style="{ minHeight: cardMinHeight + 'px' }">
            <!-- 搜索输入框 -->
            <el-autocomplete v-model="searchQuery" :fetch-suggestions="querySearch" placeholder="输入视图名称进行搜索"
              @select="handleSelect" clearable style="width: 100%; margin-bottom: 10px;"></el-autocomplete>

            <div style="display: flex; flex-direction: column; flex-shrink: 0;">
              <el-checkbox v-model="state.isCheckAll" :indeterminate="state.isIndeterminate"
                @change="handleCheckAllChange">
                全选({{ state.checkedViews.length }}/{{ state.allViews.length }})
              </el-checkbox>
            </div>

            <!-- 动态高度 + 滚动条 -->
            <div ref="scrollContainerRef" class="checkbox-scroll-container"
              :style="{ maxHeight: scrollMaxHeight + 'px' }" style="flex: 1; overflow-y: auto; ">
              <el-checkbox-group v-model="state.checkedViews" @change="handleCheckedViewsChange"
                style="display: flex; flex-direction: column">
                <div v-for="(_value, key) in state.views" :key="key" :id="`view-item-${key}`">
                  <el-checkbox :label="key" :value="key" size="large"
                    :class="{ 'now-actived': state.selectedNowView === key }" class="table-checkbox-item"
                    @click.prevent.stop="handleViewClick(key)">
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

      <!-- 右侧内容 -->
      <div class="table-main" style="flex: 3; margin-left: 20px;">
        <div style="margin: 10px;">
          <span style="font-size: 24px;font-weight: bold;">当前视图：{{ state.selectedNowView || '未选择' }}</span>
        </div>
        <el-card style="min-height: 100px;margin-bottom: 25px">
          <template #header>
            <div class="card-header">
              <span style="font-weight: bold;font-size: larger;">接口查询字段选择</span>
            </div>
          </template>
          <el-empty v-if="state.allViews.length === 0" description="暂无视图" />
          <div v-else-if="state.selectedNowView && state.views[state.selectedNowView]">
            <el-scrollbar height="150px">
              <el-checkbox-group v-model="state.views[state.selectedNowView].toSearchFields"
                @change="handleCheckedEncipherFieldsChange" style="display: flex;flex-wrap: wrap;">
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
          <el-empty v-else description="请先选择一个视图" />
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
import { onMounted, reactive, watch, computed, ref, nextTick } from 'vue';
import { useStore } from 'vuex';
import { FieldState } from '@/interface';
import router from '@/router';
import { Session } from '@/utils/cookieSet';
import { useRoute } from 'vue-router';

const store = useStore();
const route = useRoute(); // 获取路由实例

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

// ==================== 固钉 & 动态高度配置 ====================
const cardMinHeight = computed(() => {
  return window.innerHeight - 120
})
const scrollMaxHeight = computed(() => {
  return window.innerHeight - 200
})

// ==================== 搜索相关 ====================
const searchQuery = ref('');
const scrollContainerRef = ref<HTMLElement | null>(null);

const querySearch = (queryString: string, cb: Function) => {
  if (!queryString) {
    cb([]);
    return;
  }
  const results = state.allViews.filter(item =>
    item.toLowerCase().includes(queryString.toLowerCase())
  );
  cb(results.map(item => ({ value: item })));
};

const handleSelect = (item: { value: string }) => {
  const viewName = item.value;
  scrollToView(viewName);
  if (state.selectedNowView !== viewName) {
    // 若未选中则加入选中列表
    if (!state.checkedViews.includes(viewName)) {
      state.checkedViews.push(viewName);
    }
    state.selectedNowView = viewName;
    searchViewsFields(state.selectedNowView);
  }
  searchQuery.value = '';
};

const scrollToView = (viewName: string) => {
  const targetElement = document.getElementById(`view-item-${viewName}`);
  const container = scrollContainerRef.value;
  if (targetElement && container) {
    const containerRect = container.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    const offsetTop = targetRect.top - containerRect.top + container.scrollTop;
    container.scrollTo({ top: offsetTop, behavior: 'smooth' });
  }
};

// ==================== 路由参数处理：自动选中视图 ====================
const handleRouteViewParam = () => {
  const viewName = route.query?.view as string;
  if (!viewName || state.allViews.length === 0) return;

  // 视图存在才执行
  if (state.allViews.includes(viewName) && state.views[viewName]) {
    // 加入选中列表
    if (!state.checkedViews.includes(viewName)) {
      state.checkedViews.push(viewName);
    }
    // 设置为当前激活
    state.selectedNowView = viewName;
    // 加载字段
    searchViewsFields(viewName);
    // 滚动到该项
    nextTick(() => {
      scrollToView(viewName);
    });
  }
};

// ==================== 主要交互逻辑（参照表页面） ====================
// 点击单个视图（复选框区域）
const handleViewClick = (key: string) => {
  // 情况1：当前点击的就是已经激活的项 → 取消选择
  if (state.selectedNowView === key) {
    // 从选中列表中移除
    state.checkedViews = state.checkedViews.filter(item => item !== key);
    // 清空当前激活
    state.selectedNowView = '';
  }
  // 情况2：未激活 → 选中 + 激活
  else {
    // 如果未选中则加入选中列表
    if (!state.checkedViews.includes(key)) {
      state.checkedViews.push(key);
    }
    // 设置为当前激活
    state.selectedNowView = key;
    // 加载字段
    searchViewsFields(state.selectedNowView);
  }
};

// 表单选（复选框组变化时）
const handleCheckedViewsChange = async (value: string[]) => {
  const checkedCount = value.length;
  state.isCheckAll = checkedCount === state.allViews.length;
  state.isIndeterminate = checkedCount > 0 && checkedCount < state.allViews.length;
  if (value.length > 0) {
    // 最后选中的项作为当前激活项
    state.selectedNowView = value[value.length - 1];
    searchViewsFields(state.selectedNowView);
  } else {
    state.selectedNowView = '';
  }
  saveConfig();
};

// 全选/全不选
const handleCheckAllChange = (val: boolean) => {
  state.checkedViews = val ? [...state.allViews] : [];
  state.isIndeterminate = false;
  if (val && state.allViews.length > 0) {
    state.selectedNowView = state.allViews[0];
    for (let key in state.views) {
      state.views[key].isSelected = val;
      searchViewsFields(key);
    }
  } else {
    state.selectedNowView = '';
  }
};

// 监听返回值
watch(() => store.getters.getMessage, (_newVal: any) => {
  solveBackMsg();
});

watch(() => state.checkedViews, (newVal: any, oldVal: any) => {
  if (newVal.length < oldVal.length) {
    let re = oldVal.filter((item: any) => !newVal.includes(item));
    re.forEach((item: any) => {
      if (state.views[item]) state.views[item].isSelected = false;
    });
  }
});

// 消息处理函数
const solveBackMsg = async () => {
  let data = store.getters.getMessage;
  if (data.error) {
    console.error(data.error);
  } else if (data.code === '2000') {
    if (data.type === 'query_views') {
      if (data.results.length !== 0) {
        state.allViews = data.results.map((item: any) => item.Name);
        state.checkedViews = [state.allViews[0]];
        state.selectedNowView = state.allViews[0];
        initViews();
        state.views[state.selectedNowView].isSelected = true;
        searchViewsFields(state.selectedNowView);
        
        // 视图加载完成后处理路由参数
        nextTick(() => {
          handleRouteViewParam();
        });
      }
    }
    if (data.type === 'query_views_fields') {
      if (state.views[state.selectedNowView]) {
        state.views[state.selectedNowView].fields = data.results;
        state.views[state.selectedNowView].isSelected = true;
      }
    }
  } else if (data.code === '2001') {
    console.log('数据库连接错误，检查参数');
  }
};

onMounted(async () => {
  if (Object.keys(Session.get('Config').views || {}).length === 0) {
    const queryData = {
      operation: 'query_views',
      query: "show table status where comment='view';"
    };
    await store.dispatch('websocket/executeQuery', queryData);
  } else {
    state.views = Session.get('Config').views;
    state.checkedViews = Session.get('Config').selectedViews || [];
    state.allViews = Object.keys(Session.get('Config').views);
    state.selectedNowView = state.allViews[0] || '';
    
    // 读取本地缓存后处理路由参数
    nextTick(() => {
      handleRouteViewParam();
    });
    
    if (state.selectedNowView && !state.views[state.selectedNowView]?.fields?.length) {
      searchViewsFields(state.selectedNowView);
    }
  }
});

const initViews = () => {
  state.views = state.allViews.reduce(function (accumulator: any, currentValue: any) {
    accumulator[currentValue] = {
      isSelected: false,
      name: currentValue,
      toSearchFields: [],
      fields: [],
    };
    return accumulator;
  }, {});
};

const searchViewsFields = async (key: any) => {
  if (!key) return;
  const queryData = {
    operation: 'query_views_fields',
    query: `SHOW COLUMNS FROM \`${key}\`;`
  };
  await store.dispatch('websocket/executeQuery', queryData);
};

const handleCheckedEncipherFieldsChange = (value: any) => {
  console.log(value);
};

const handlePrev = () => {
  store.dispatch('stepMark/setActiveStep', 2);
  router.push({ name: 'step2', params: {} });
};

const handleNext = () => {
  store.dispatch('stepMark/setActiveStep', 4);
  saveConfig();
  router.push({ name: 'step4', params: {} });
};

const saveConfig = async () => {
  const updatedConfig = {
    selectedViews: state.checkedViews,
    views: state.views,
  };
  const newDataConfigLocal = {
    ...Session.get('Config'),
    ...updatedConfig,
  };
  Session.set('Config', newDataConfigLocal);
};
</script>

<style scoped>

</style>