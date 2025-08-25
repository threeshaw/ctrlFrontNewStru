<template>
  <div class="variable-list">
    <div class="visArea" v-if = "visualize">
      <button @click="closeVis"></button>
      <dataList></dataList>
    </div>
    <div class="list-header">
      <div class="header-info" v-if="fileInfo">
        <div class="file-name">文件: {{ fileInfo.name }}</div>
        <div class="file-details">
          变量数: {{ fileInfo.variablesCount }} | 
          数据行: {{ fileInfo.dataRows }} | 
          大小: {{ fileInfo.size }}
        </div>
      </div>
      
      <div class="header-actions">
        <div class="selected-count" v-if="selectedVariables.length > 0">
          已选择 {{ selectedVariables.length }} 个变量
        </div>
        <button 
          class="btn-action delete" 
          :disabled="selectedVariables.length === 0"
          @click="deleteSelected"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          删除
        </button>
        <button 
          class="btn-action visualize" 
          :disabled="selectedVariables.length === 0"
          @click="visualizeSelected"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          可视化
        </button>
        <button 
          class="btn-action analyze" 
          :disabled="selectedVariables.length === 0"
          @click="analyzeSelected"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 21l-6-6m6 6v-4.8m0 4.8h-4.8"></path>
            <circle cx="10" cy="10" r="7"></circle>
          </svg>
          分析
        </button>
        <button class="btn-action clear" @click="clearAll">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
          </svg>
          清空
        </button>
        <button @click="modifyVariable">
          修改数据
        </button>
        <button @click="dataOut">
          导出选中数据
        </button>
      </div>
      
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="搜索变量..." 
        >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#777">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>
    </div>
    
    <div class="list-container">
      <table>
        <thead>
          <tr>
            <th class="checkbox-col">
              <input 
                type="checkbox" 
                :checked="allSelected" 
                @change="toggleSelectAll"
              >
            </th>
            <th>点位号</th>
            <th>描述</th>
            <th>单位</th>
            <th>量程上限</th>
            <th>量程下限</th>
            <th>属性</th>
            <th>类型</th>
            <!-- <th>首值</th> -->
            <!-- <th>最小值</th>
            <th>最大值</th>
            <th>平均值</th> -->
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="variable in filteredVariables" 
            :key="variable.id"
            :class="{ selected: isSelected(variable) }"
          >
            <td class="checkbox-col">
              <input 
                type="checkbox" 
                :checked="isSelected(variable)" 
                @change="toggleSelection(variable)"
              >
            </td>
            <td>{{ variable.tag }}</td>
            <td>{{ variable.description }}</td>
            <td>{{ variable.unit }}</td>
            <td>{{ variable.rangeHigh !== null ? variable.rangeHigh : '-' }}</td>
            <td>{{ variable.rangeLow !== null ? variable.rangeLow : '-' }}</td>
            <td>{{ variable.property || '-' }}</td>
            <td><select v-model="variable.IOtype" @change="toggleIOtype(variable,variable.IOtype)">
                <option value="undefined">未定义</option>
                <option value="mv">输入</option>
                <option value="cv">输出</option>
              </select></td>
            <!-- <td>{{ variable.firstValue !== null ? variable.firstValue.toFixed(2) : '-' }}</td>
            <td>{{ variable.min !== null ? variable.min.toFixed(2) : '-' }}</td>
            <td>{{ variable.max !== null ? variable.max.toFixed(2) : '-' }}</td>
            <td>{{ variable.mean !== null ? variable.mean : '-' }}</td> -->
            <td>
              <button class="btn-icon" @click="visualizeVariable(variable)" title="可视化">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0078d4" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
              <button class="btn-icon" @click="analyzeVariable(variable)" title="分析">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0078d4" stroke-width="2">
                  <path d="M21 21l-6-6m6 6v-4.8m0 4.8h-4.8"></path>
                  <circle cx="10" cy="10" r="7"></circle>
                </svg>
              </button>
              <button class="btn-icon delete" @click="deleteVariable(variable)" title="删除">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff4d4f" stroke-width="2">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"></path>
                </svg>
              </button>
              
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="filteredVariables.length === 0" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
        <h3>没有可显示的变量</h3>
        <p>请导入数据文件以显示变量列表</p>
        <button class="btn-import" @click="openImportModal">导入数据</button>
      </div>
    </div>
    <div>
      <DataModify @stopvis="stopMod" :visible="modify"></DataModify>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, toValue } from 'vue'
import { useModelStore } from '@/store/modelStore'
import dataList from '../datalist/datalist.vue'
import DataModify from './DataModify.vue'

const modelStore = useModelStore()
const searchQuery = ref('')
const modify = ref(false)
const modifyVariable = () =>{
  modify.value = true
}
const stopMod = () =>{
  modify.value = false
  console.log(modify.value)
}

const visualize = ref(false)
const closeVis = () =>{
  visualize.value = false
}
// 使用计算属性访问状态
const selectedVariables = computed(() => modelStore.selectedVariables || [])
const variables = computed(() => modelStore.variables || [])
const fileInfo = computed(() => modelStore.fileInfo)

const filteredVariables = computed(() => {
  if (!searchQuery.value) return variables.value
  const query = searchQuery.value.toLowerCase()
  return variables.value.filter(v => 
    (v.tag && v.tag.toLowerCase().includes(query)) ||
    (v.description && v.description.toLowerCase().includes(query)) ||
    (v.unit && v.unit.toLowerCase().includes(query)) ||
    (v.property && v.property.toLowerCase().includes(query))
  )
})
const test = ()=>{
  console.log(selectedVariables.value[0])
}
const allSelected = computed(() => {
  return variables.value.length > 0 && 
         selectedVariables.value.length === variables.value.length
})

const isSelected = (variable) => {
  return selectedVariables.value.some(v => v.id === variable.id)
}

const toggleSelection = (variable) => {
  modelStore.toggleVariableSelection(variable)
}

const toggleSelectAll = () => {
  if (allSelected.value) {
    modelStore.selectedVariables = []
  } else {
    modelStore.selectedVariables = [...variables.value]
  }
}

const dataOut = () =>{
  modelStore.transposedData()
}
const toggleIOtype = (a,b) =>{
  console.log(a.id)
  modelStore.toggleVariableIO(a,b)
}
const deleteSelected = () => {
  modelStore.deleteSelectedVariables()
}

const visualizeSelected = () => {
  //modelStore.visualizeSelectedVariables()
visualize.value = true
}

const analyzeSelected = () => {
  modelStore.analyzeSelectedVariables()
}

const clearAll = () => {
  modelStore.clearAllVariables()
}

const deleteVariable = (variable) => {
  modelStore.selectedVariables = [variable]
  modelStore.deleteSelectedVariables()
}

const visualizeVariable = (variable) => {
  modelStore.selectedVariables = [variable]
  modelStore.visualizeSelectedVariables()
}

const analyzeVariable = (variable) => {
  modelStore.selectedVariables = [variable]
  modelStore.analyzeSelectedVariables()
}

const openImportModal = () => {
  modelStore.toggleDataImportModal(true)
}
</script>

<style scoped>
.variable-list {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.list-header {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 15px 20px;
  background: #f9fbfe;
  border-bottom: 1px solid #e0ecff;
}

.header-info {
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.file-name {
  font-weight: 600;
  margin-bottom: 5px;
  color: #0078d4;
}

.file-details {
  font-size: 13px;
  color: #666;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.selected-count {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  background: #e6f3ff;
  border-radius: 4px;
  color: #0078d4;
  font-size: 14px;
  margin-right: 10px;
}

.btn-action {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-action.delete {
  color: #ff4d4f;
  border-color: #ffccc7;
}

.btn-action.delete:hover {
  background: #fff2f0;
}

.btn-action.visualize {
  color: #0078d4;
  border-color: #cce4ff;
}

.btn-action.visualize:hover {
  background: #f0f7ff;
}

.btn-action.analyze {
  color: #52c41a;
  border-color: #d9f7be;
}

.btn-action.analyze:hover {
  background: #f6ffed;
}

.btn-action.clear {
  color: #fa8c16;
  border-color: #ffe7ba;
}

.btn-action.clear:hover {
  background: #fff7e6;
}

.search-box {
  position: relative;
  align-self: flex-end;
  margin-top: 10px;
}

.search-box input {
  padding: 8px 12px 8px 32px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 250px;
  font-size: 14px;
}

.search-box svg {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
}

.list-container {
  overflow: auto;
  max-height: 500px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  table-layout: fixed;
}

thead {
  background: #f5f5f5;
  position: sticky;
  top: 0;
}

th {
  text-align: left;
  padding: 12px 8px;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #eee;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

th:nth-child(1) { width: 40px; } /* 选择框列 */
th:nth-child(2) { width: 100px; } /* 点位号 */
th:nth-child(3) { width: 120px; } /* 描述 */
th:nth-child(4) { width: 60px; } /* 单位 */
th:nth-child(5), 
th:nth-child(6) { width: 80px; } /* 量程上下限 */
th:nth-child(7) { width: 100px; } /* 属性 */
th:nth-child(8),
th:nth-child(9),
th:nth-child(10),
th:nth-child(11) { width: 70px; }  /* 数值列 */
th:nth-child(12) { width: 100px; } /* 操作列 */

td {
  padding: 10px 8px;
  border-bottom: 1px solid #f0f0f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

tbody tr:hover {
  background: #f9f9f9;
}

tbody tr.selected {
  background: #f0f7ff;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  margin-right: 3px;
}

.btn-icon:hover {
  background: #f0f0f0;
}

.btn-icon.delete:hover {
  background: #fff2f0;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #777;
}

.empty-state h3 {
  margin: 20px 0 10px;
  color: #555;
}

.empty-state p {
  margin-bottom: 20px;
}

.btn-import {
  background: #0078d4;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-import:hover {
  background: #106ebe;
}
</style>