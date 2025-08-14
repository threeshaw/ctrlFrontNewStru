<template>
  <div id="workspace">
    <div v-if="!currentPage || currentPage === '欢迎使用 SIA-APC 先进控制与优化软件'" class="welcome-screen">
      <div class="welcome-header">
        <h1>欢迎使用 SIA-APC 先进过程控制与优化软件</h1>
        <!-- <p>请在左侧导航选择功能，或通过顶部菜单操作。</p> -->
      </div>
    </div>
    
    <div v-else class="content-area">
      <h2>{{ currentPage }}</h2>
      
      <div class="content-container">
        <!-- 导入数据界面 -->
        <div v-if="currentPage === '导入数据'" class="data-import-view">
          <div class="import-header">
            <div class="file-info" v-if="modelStore.fileInfo">
              <div class="file-name">当前文件: {{ modelStore.fileInfo.name }}</div>
              <div class="file-details">
                变量数: {{ modelStore.fileInfo.variablesCount }} | 
                数据行: {{ modelStore.fileInfo.dataRows }} | 
                大小: {{ modelStore.fileInfo.size }} | 
                修改时间: {{ modelStore.fileInfo.lastModified }}
              </div>
            </div>
            <div v-else class="no-file-info">
              尚未导入任何数据文件
            </div>
            <button class="btn-import" @click="openImportModal">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              导入数据
            </button>
          </div>
          
          <VariableList />
        </div>

        
        <div v-if="currentPage === '数据可视化'" class="data-import-view">
          <h1>12344</h1>
          <div>
            <dataList :filein="variables"></dataList>
          </div>
        </div>
        <!-- 其他页面保持不变 -->
      </div>
    </div>
    
    <DataImportModal 
      v-model:visible="modelStore.showDataImportModal"
      @import-complete="handleImportComplete"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useModelStore } from '@/store/modelStore'
import DataImportModal from '@/components/common/DataImportModal.vue'
import VariableList from '@/components/common/VariableList.vue'
import dataList from '../datalist/datalist.vue'
const modelStore = useModelStore()
const currentPage = computed(() => modelStore.currentPage)
const variables = computed(() => modelStore.variables || [])
const openImportModal = () => {
  modelStore.toggleDataImportModal(true)
}

const handleImportComplete = () => {
  modelStore.setCurrentPage('导入数据')
}
</script>


<style scoped>
#workspace {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #fff;
}

.welcome-screen {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 20px;
  background: linear-gradient(to right, #e6f3ff, #f0f7ff);
  border-radius: 8px;
}

.welcome-header h1 {
  color: #0078d4;
  margin-bottom: 10px;
}

.welcome-header p {
  color: #555;
  font-size: 18px;
}

.dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.dashboard-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  border: 1px solid #eee;
}

.dashboard-card h3 {
  color: #0078d4;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.project-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.project-item:last-child {
  border-bottom: none;
}

.data-import-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.import-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f9fbfe;
  border-radius: 8px;
  border: 1px solid #e0ecff;
}

.file-info {
  flex: 1;
}

.file-name {
  font-weight: 500;
  margin-bottom: 5px;
}

.file-details {
  font-size: 13px;
  color: #777;
}

.no-file-info {
  flex: 1;
  color: #999;
  font-style: italic;
}

.btn-import {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #0078d4;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-import:hover {
  background: #106ebe;
}

.quick-links {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.quick-links button {
  padding: 10px;
  background: #e6f3ff;
  border: 1px solid #cce4ff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-links button:hover {
  background: #d0e7ff;
  border-color: #0078d4;
}

</style>