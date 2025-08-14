<template>
  <div class="status-bar">
    <div class="status-item">
      <span class="status-label">当前工程:</span>
      <span class="status-value">{{ currentProject }}</span>
    </div>
    <div class="status-item">
      <span class="status-label">状态:</span>
      <span class="status-value">{{ statusMessage }}</span>
    </div>
    <div class="status-item">
      <span class="status-label">上次保存:</span>
      <span class="status-value">{{ lastSaved }}</span>
    </div>
    <div class="status-spacer"></div>
    <div class="status-item">
      <span class="status-label">用户:</span>
      <span class="status-value">{{ currentUser }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '@/store/authStore'

const authStore = useAuthStore()

const currentProject = ref('HO701 - 精馏塔建模与优化')
const statusMessage = ref('就绪')
const lastSaved = ref('2025-08-8 14:30:22')
const currentUser = ref(authStore.user || '未登录')

// 模拟状态更新
let timer
onMounted(() => {
  timer = setInterval(() => {
    lastSaved.value = new Date().toLocaleString()
  }, 60000)
})

onBeforeUnmount(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.status-bar {
  display: flex;
  align-items: center;
  background: #e6f3ff;
  border-top: 1px solid #ccc;
  height: 28px;
  padding: 0 12px;
  font-size: 12px;
  color: #333;
}

.status-item {
  display: flex;
  margin-right: 20px;
}

.status-label {
  font-weight: 600;
  margin-right: 5px;
}

.status-value {
  color: #0078d4;
}

.status-spacer {
  flex: 1;
}
</style>