<template>
    <!-- 回到顶部按钮，默认固定在右下角 -->
    <div v-show="showTop" class="back-to-top" @click="scrollToTop" title="回到顶部">
        <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <path d="M512 384l256 256-64 64-192-192-192 192-64-64z" fill="#ffffff"></path>
        </svg>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// 控制按钮显示/隐藏
const showTop = ref(false)

// 监听滚动事件
const handleScroll = () => {
    // 滚动距离大于 300px 时显示按钮
    showTop.value = window.scrollY > 300
}

// 回到顶部（平滑滚动）
const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    })
}

// 挂载时监听滚动
onMounted(() => {
    window.addEventListener('scroll', handleScroll)
})

// 卸载时移除监听（防止内存泄漏）
onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.back-to-top {
    position: fixed;
    right: 45px;
    bottom: 45px;
    width: 48px;
    height: 48px;
    background-color: #409eff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
    z-index: 999;
}

.back-to-top:hover {
    background-color: #66b1ff;
    transform: translateY(-3px);
}

.icon {
    width: 24px;
    height: 24px;
}
</style>