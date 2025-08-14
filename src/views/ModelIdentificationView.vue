<template>
  <div class="model-identification-view">
    <ModelTopMenuBar />
    
    <div class="main-container">
      <div class="sidebar">
        <ProcessDataPanel />
        <ProcessModelsPanel />
        <MPC_config />
        <PID_config />
        
      </div>
      
      <WorkspaceArea :currentPage="currentPage" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ModelTopMenuBar from '@/components/common/ModelTopMenuBar.vue'
import ProcessDataPanel from '@/components/model-identification/ProcessDatapanel.vue'
import ProcessModelsPanel from '@/components/model-identification/ProcessModelsPanel.vue'
import WorkspaceArea from '@/components/common/WorkspaceArea.vue'
import MPC_config from '@/components/model-identification/MPC_config.vue'
import PID_config from '@/components/model-identification/PID_config.vue'

const currentPage = ref('欢迎使用 SIA-APC 先进控制与优化软件')
</script>

<style scoped>
.model-identification-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f7f7f7;
}

.main-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 220px;
  background: #fff;
  border-right: 1px solid #ddd;
  padding: 8px;
  overflow-y: auto;
}
</style>