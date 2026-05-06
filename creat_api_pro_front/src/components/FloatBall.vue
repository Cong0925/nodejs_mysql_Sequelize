<template>
    <!-- 悬浮球 -->
    <div v-if="showBall" ref="ballRef" class="float-ball" :style="{ left: ballX + 'px', top: ballY + 'px' }"
        @mousedown="startDragBall" @click="handleClickBall">
        tips
    </div>

    <!-- 可拖拽面板（置顶、不阻塞页面） -->
    <div v-if="showPanel" ref="panelRef" class="float-panel" :style="{ left: panelX + 'px', top: panelY + 'px' }"
        @mousedown="startDragPanel">
        <div class="panel-head">
            <span>待完成项</span>
            <span class="close" @click="closePanel">×</span>
        </div>
        <div class="panel-body">
            <div class="note-item">1. </div>
            <div class="note-item">2. </div>
            <div class="note-item">3.</div>
            <div class="note-item">4.</div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 悬浮球
const showBall = ref(true)
const ballRef = ref(null)
const ballX = ref(window.innerWidth - 70)
const ballY = ref(window.innerHeight / 2 - 50)

// 面板
const showPanel = ref(false)
const panelRef = ref(null)
const panelX = ref(window.innerWidth / 2 - 200)
const panelY = ref(100)

// 拖拽通用变量
let isDrag = false
let startX = 0
let startY = 0
let originX = 0
let originY = 0

const ballW = 50
const ballH = 50
const panelW = 400
const panelH = 220

// --- 悬浮球拖拽 ---
function startDragBall(e) {
    isDrag = true
    startX = e.clientX
    startY = e.clientY
    originX = ballX.value
    originY = ballY.value
    document.addEventListener('mousemove', moveBall)
    document.addEventListener('mouseup', stopDrag)
    e.preventDefault()
}

function moveBall(e) {
    if (!isDrag) return
    let nx = originX + (e.clientX - startX)
    let ny = originY + (e.clientY - startY)

    // 边界限制
    nx = Math.max(0, Math.min(nx, window.innerWidth - ballW))
    ny = Math.max(0, Math.min(ny, window.innerHeight - ballH))

    ballX.value = nx
    ballY.value = ny
}

// --- 面板拖拽 ---
function startDragPanel(e) {
    isDrag = true
    startX = e.clientX
    startY = e.clientY
    originX = panelX.value
    originY = panelY.value
    document.addEventListener('mousemove', movePanel)
    document.addEventListener('mouseup', stopDrag)
    e.preventDefault()
}

function movePanel(e) {
    if (!isDrag) return
    let nx = originX + (e.clientX - startX)
    let ny = originY + (e.clientY - startY)

    nx = Math.max(0, Math.min(nx, window.innerWidth - panelW))
    ny = Math.max(0, Math.min(ny, window.innerHeight - panelH))

    panelX.value = nx
    panelY.value = ny
}

// 停止拖拽
function stopDrag() {
    isDrag = false
    document.removeEventListener('mousemove', moveBall)
    document.removeEventListener('mousemove', movePanel)
    document.removeEventListener('mouseup', stopDrag)
}

// 点击悬浮球 → 打开面板
function handleClickBall() {
    if (Math.abs(ballX.value - originX) < 8 && Math.abs(ballY.value - originY) < 8) {
        showBall.value = false
        showPanel.value = true
    }
}

// 关闭面板 → 显示悬浮球
function closePanel() {
    showPanel.value = false
    showBall.value = true
}
</script>

<style scoped>
/* 悬浮球 */
.float-ball {
    position: fixed;
    z-index: 999999;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #409eff;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: move;
    user-select: none;
    box-shadow: 0 2px 15px rgba(64, 158, 255, 0.4);
}

/* 面板 */
.float-panel {
    position: fixed;
    z-index: 999999;
    width: 400px;
    height: 220px;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    cursor: move;
}

.panel-head {
    padding: 4px 10px;
    background: #409eff;
    color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
}

.close {
    cursor: pointer;
    font-size: 28px;
    line-height: 30px;
}

.panel-body {
    padding: 5px 10px;
    height: 100%;
    font-size: 14px;
    color: #333;
    line-height: 1.8;
    cursor: default;
    background: #fffef0;
}

/* 每条便签条目，序号自带、顶格排列 */
.note-item {
    text-align: left;
    padding: 2px 0;
}
</style>