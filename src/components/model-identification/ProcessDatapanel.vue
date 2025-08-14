<template>
  <div class="panel">
    <div class="panelTitle" @click="togglePanel">
      过程数据
    </div>
    <div class="panelBody" v-show="isOpen">
      <!-- <div @click="showPage('过程数据')">过程数据</div> -->
      <div @click="showPage('导入数据')">导入数据</div>
      <div @click="openImportModal('数据预处理')">数据预处理</div>
      <div @click="showPage('数据可视化')">数据可视化</div>
      <div @click="showPage('数据分析')">数据分析</div>
      <div @click="showPage('变量配置')">变量配置</div>
      <div @click="showPage('导出数据')">导出数据</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useModelStore } from '@/store/modelStore'

const isOpen = ref(true)
const modelStore = useModelStore()

const togglePanel = () => {
  isOpen.value = !isOpen.value
}

const showPage = (pageName) => {
  modelStore.setCurrentPage(pageName)
}

const openImportModal = () => {
  modelStore.toggleDataImportModal(true)
  modelStore.setCurrentPage('导入数据')
}
</script>


<style scoped>
.panel {
  margin-bottom: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.panelTitle {
  background: #e6f3ff;
  padding: 8px 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s;
}

.panelTitle:hover {
  background: #d0e7ff;
}

.panelTitle::after {
  content: "▼";
  font-size: 10px;
  transition: transform 0.3s;
}

.panelTitle.collapsed::after {
  transform: rotate(-90deg);
}

.panelBody {
  background: #ffffff;
  padding: 8px 0;
  font-size: 13px;
  border-top: 1px solid #f0f0f0;
}

.panelBody div {
  cursor: pointer;
  padding: 6px 12px 6px 20px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

.panelBody div:hover {
  background: #f0f7ff;
  color: #0078d4;
}

.panelBody div::before {
  content: "•";
  margin-right: 8px;
  color: #0078d4;
  font-size: 16px;
}
</style>