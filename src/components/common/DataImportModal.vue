<template>
  <div class="modal" v-if="visible">
    <div class="modal-content">
      <h3>导入数据文件</h3>
      
      <div v-if="parseError" class="error-message">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff4d4f"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12" y2="16"></line></svg>
        {{ parseError }}
      </div>
      
      <div class="file-upload-area" @dragover.prevent @drop="handleDrop">
        <div v-if="!file" class="upload-prompt">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0078d4" stroke-width="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <p>拖放CSV/TXT文件到此处，或</p>
          <button class="btn-browse" @click="triggerFileInput">浏览文件</button>
          <div class="file-requirements">
            <h4>文件格式要求：</h4>
            <ol>
              <li>第一行：点位号 (如: TIC101, PICA102)</li>
              <li>第二行：变量描述 (如: 温度, 压力)</li>
              <li>第三行：单位 (如: °C, kPa)</li>
              <li>第四行：量程上限 (数值)</li>
              <li>第五行：量程下限 (数值)</li>
              <li>第六行：属性 (如: 自恒, 积分变量)</li>
              <li>第七行开始：实际数据 (数值)</li>
            </ol>
          </div>
        </div>
        
        <div v-else class="file-preview">
          <div class="file-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0078d4" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div class="file-info">
            <div class="file-name">{{ file.name }}</div>
            <div class="file-size">{{ (file.size / 1024).toFixed(2) }} KB</div>
          </div>
          <button class="btn-remove" @click="removeFile">移除</button>
        </div>
        
        <input 
          type="file" 
          ref="fileInput" 
          @change="handleFileSelect" 
          accept=".csv,.txt" 
          style="display: none"
        >
      </div>
      
      <div class="progress-area" v-if="loading">
        <div class="progress-bar">
          <div class="progress" :style="{ width: progress + '%' }"></div>
        </div>
        <div class="progress-text">正在处理数据: {{ progress }}%</div>
      </div>
      
      <div class="modal-actions">
        <button 
          class="btn-primary" 
          :disabled="!file || loading" 
          @click="importFile"
        >
          导入数据
        </button>
        <button class="btn-secondary" @click="close">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useModelStore } from '@/store/modelStore'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['update:visible', 'import-complete'])

const modelStore = useModelStore()
const file = ref(null)
const fileInput = ref(null)
const loading = ref(false)
const progress = ref(0)
const parseError = ref(null)

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileSelect = (e) => {
  if (e.target.files.length > 0) {
    file.value = e.target.files[0]
    parseError.value = null
  }
}

const handleDrop = (e) => {
  e.preventDefault()
  if (e.dataTransfer.files.length > 0) {
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.txt')) {
      file.value = droppedFile
      parseError.value = null
    } else {
      parseError.value = '请选择CSV或TXT文件'
    }
  }
}

const removeFile = () => {
  file.value = null
  parseError.value = null
}

const importFile = async () => {
  if (!file.value) return
  
  loading.value = true
  progress.value = 0
  parseError.value = null
  
  // 模拟导入进度
  const interval = setInterval(async () => {
    progress.value += 10
    if (progress.value >= 100) {
      clearInterval(interval)
      
      // 实际导入处理
      try {
        await modelStore.importData(file.value)
        emit('import-complete')
        close()
      } catch (error) {
        parseError.value = error
        loading.value = false
      }
    }
  }, 200)
}

const close = () => {
  file.value = null
  loading.value = false
  progress.value = 0
  parseError.value = null
  emit('update:visible', false)
}
</script>

<style scoped>
/* 样式保持不变，添加错误消息样式 */

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 24px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

h3 {
  margin-bottom: 20px;
  color: #0078d4;
  text-align: center;
}

.file-upload-area {
  border: 2px dashed #cce4ff;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  background: #f5f9ff;
  transition: all 0.3s;
  margin-bottom: 20px;
}

.file-upload-area:hover {
  border-color: #0078d4;
  background: #e6f3ff;
}

.upload-prompt p {
  margin: 10px 0;
  color: #555;
}

.btn-browse {
  background: #0078d4;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 10px;
}

.btn-browse:hover {
  background: #106ebe;
}

.file-types {
  font-size: 12px;
  color: #888;
  margin-top: 5px;
}

.file-preview {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 6px;
  padding: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.file-icon {
  margin-right: 15px;
}

.file-info {
  flex: 1;
  text-align: left;
}

.file-name {
  font-weight: 500;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 12px;
  color: #777;
}

.btn-remove {
  background: #f0f0f0;
  color: #555;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-remove:hover {
  background: #e0e0e0;
}

.progress-area {
  margin-bottom: 20px;
}

.progress-bar {
  height: 10px;
  background: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: #0078d4;
  transition: width 0.3s;
}

.progress-text {
  text-align: center;
  font-size: 12px;
  color: #555;
  margin-top: 5px;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.btn-primary {
  background: #0078d4;
  color: white;
  border: none;
  padding: 10px 25px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 15px;
}

.btn-primary:hover {
  background: #106ebe;
}

.btn-primary:disabled {
  background: #a0c4e4;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
  padding: 10px 25px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 15px;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.error-message {
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 4px;
  padding: 10px 15px;
  margin-bottom: 15px;
  color: #ff4d4f;
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-requirements {
  margin-top: 20px;
  padding: 15px;
  background: #f5f9ff;
  border-radius: 6px;
  border: 1px dashed #cce4ff;
  text-align: left;
}

.file-requirements h4 {
  margin-bottom: 10px;
  color: #0078d4;
}

.file-requirements ol {
  padding-left: 20px;
}

.file-requirements li {
  margin-bottom: 5px;
  font-size: 13px;
}
</style>