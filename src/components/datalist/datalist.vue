<template>
  <!-- 主应用 -->
  <div class="containerdata">
    <div>选择数据</div>
    <div class="container">
      <div class="header">
        <h2>文件选择器</h2>
        <p class="subtitle">添加文件名并从下拉框中选择</p>
      </div>
      <button @click="changeShowMode">切换显示</button>
      <!-- 两种界面 or 一个界面两个选择：可以使用两个绘图？两个模块：在一个格子里叠5个图，两种使用v-if切换 -->
    </div>

    <div class="visualization-area">
      <div class="canvas-container">
        <div class="select-container" v-if="singleShow">
          <select v-model="selectedFile1">
            <option value="" disabled>请选择文件1</option>
            <option v-for="(file, index) in leftFileList" :key="index" :value="index">
              {{ file }}
            </option>
          </select>
          <button @click="loadFile1(selectedFile1)">loadfile1</button>
          <select v-model="selectedFile2">
            <option value="" disabled>请选择文件2</option>
            <option v-for="(file, index) in leftFileList" :key="index" :value="index">
              {{ file }}
            </option>
          </select>
          <button @click="loadFile2(selectedFile2)">loadfile2</button>
          <div class="selection">
            <p v-if="selectedFile1" class="file-name">
              当前选择: {{ leftFileList[selectedFile1] }}
            </p>
            <p v-else class="empty">未选择文件</p>
            <canvas ref="canvas" width="700" height="500"></canvas>
            <div v-if="!currentData1.length" class="no-data">
              <p>选择文件加载数据</p>
            </div>
          </div>
        </div>

        <div calss="multiContainer" v-if="multiShow">
          <div>
            <select v-model="multiSelectedFile1">
              <option value="" disabled>请选择文件1</option>
              <option v-for="(file, index) in leftFileList" :key="index" :value="index">
                {{ file }}
              </option>
            </select>
            <button @click="changeReload1">reload</button>
            <tst1 :datain="files" :index1="multiFile1"></tst1>
          </div>
          <div>
            <select v-model="multiSelectedFile2">
              <option value="" disabled>请选择文件2</option>
              <option v-for="(file, index) in leftFileList" :key="index" :value="index">
                {{ file }}
              </option>
            </select>
            <button @click="changeReload2">reload</button>
            <tst1 :datain="files" :index1="multiFile2"></tst1>
          </div>
        </div>
      </div>

      <div class="controls" v-if="false">
        <div class="info-panel">
          <h3>数据信息</h3>
          <div v-if="currentData1.length">
            <p>当前数据集: {{ activeFileName }}</p>
            <div class="stats">
              <div class="stat-item">
                <h4>数据点数量</h4>
                <div class="stat-value">{{ currentData1.length }}</div>
              </div>
              <div class="stat-item">
                <h4>X轴范围</h4>
                <div class="stat-value">{{ xMin }} - {{ xMax }}</div>
              </div>
              <div class="stat-item">
                <h4>Y轴范围</h4>
                <div class="stat-value">{{ yMin }} - {{ yMax }}</div>
              </div>
            </div>
          </div>
          <p v-else>未加载任何数据</p>
        </div>

        <div class="button-group">
          <button @click="generateRandomData">下一步</button>
          <button @click="clearCanvas">清除画布</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import tst1 from './basicCav.vue'

const multiShow = ref(false)
const singleShow = ref(true)
const changeShowMode = () => {
  multiShow.value = !multiShow.value
  singleShow.value = !singleShow.value
}
const canvas = ref(null)
const ctx = ref(null)
const fileInput = ref(null)
const dataInChart = ref([])
// 文件数据
const props = defineProps({
  filein: {
    default: [],
  },
})
const selectedFile1 = ref('')
const selectedFile2 = ref('')
const multiSelectedFile1 = ref('')
let multiFile1 = ref(0)
const changeReload1 = () => {
  multiFile1.value = multiSelectedFile1.value
  console.log(multiFile1.value)
}

const multiSelectedFile2 = ref('')
let multiFile2 = ref(1)
const changeReload2 = () => {
  multiFile2.value = multiSelectedFile2.value
}

const files = ref(props.filein)
const leftFileList = ref(['1'])
const activeFileIndex = ref(-1)
const currentData1 = ref([]) //一图两个
const currentData2 = ref([])
const renewChart = () => {
  leftFileList.value = []
  dataInChart.value = []

  for (let i = 0; i < files.value.length; i = i + 1) {

    leftFileList.value.push(files.value[i].tag)
  }
}
// 新文件数据模型

// 计算数据范围：选择最大的范围
const xRange1 = computed(() => {
  if (!currentData1.value.length) return [0, 0]
  const xs = currentData1.value.map((p) => p[0])
  return [Math.min(...xs), Math.max(...xs)]
})
const xRange2 = computed(() => {
  if (!currentData2.value.length) return [0, 0]
  const xs = currentData2.value.map((p) => p[0])
  return [Math.min(...xs), Math.max(...xs)]
})

const yRange1 = computed(() => {
  if (!currentData1.value.length) return [0, 0]
  const ys = currentData1.value.map((p) => p[1])
  return [Math.min(...ys), Math.max(...ys)]
})
const yRange2 = computed(() => {
  if (!currentData2.value.length) return [0, 0]
  const ys = currentData2.value.map((p) => p[1])
  return [Math.min(...ys), Math.max(...ys)]
})

const activeFileName = computed(() => {
  return activeFileIndex.value >= 0 ? files.value[activeFileIndex.value].name : ''
})

// 加载文件数据
const loadFile1 = (index) => {
  activeFileIndex.value = index
  currentData1.value = files.value[index].data
  drawScatterPlot1()
  console.log(files.value[0].data)
}
const loadFile2 = (index) => {
  activeFileIndex.value = index
  currentData2.value = [...files.value[index].data]
  drawScatterPlot1()
}

// 绘制散点图1
const drawScatterPlot1 = () => {

  if (!ctx.value || !currentData1.value.length) return

  const canvasEl = canvas.value
  const width = canvasEl.width
  const height = canvasEl.height
  const padding = 50
  const xMin = Math.min(xRange1.value[0], xRange2.value[0])
  const xMax = Math.max(xRange1.value[1], xRange2.value[1])
  const yMin = Math.min(yRange1.value[0], yRange2.value[0])
  const yMax = Math.max(yRange1.value[1], yRange2.value[1])
  // 计算比例因子

  let scaleX = (width - 2 * padding) / (xMax - xMin)
  let scaleY = (height - 2 * padding) / (yMax - yMin)

  // 设置画布尺寸

  ctx.value.clearRect(0, 0, canvasEl.width, canvasEl.height)

  // 设置画布尺寸

  // 绘制坐标轴
  ctx.value.strokeStyle = '#4fc3f7'
  ctx.value.lineWidth = 2
  ctx.value.beginPath()
  ctx.value.moveTo(padding, padding)
  ctx.value.lineTo(padding, height - padding)
  ctx.value.lineTo(width - padding, height - padding)
  ctx.value.stroke()

  // 绘制网格
  ctx.value.strokeStyle = 'rgba(79, 195, 247, 0.2)'
  ctx.value.lineWidth = 1

  // X轴网格
  for (let i = 1; i < 10; i++) {
    const x = padding + (i * (width - 2 * padding)) / 10
    ctx.value.beginPath()
    ctx.value.moveTo(x, padding)
    ctx.value.lineTo(x, height - padding)
    ctx.value.stroke()
  }

  // Y轴网格
  for (let i = 1; i < 10; i++) {
    const y = padding + (i * (height - 2 * padding)) / 10
    ctx.value.beginPath()
    ctx.value.moveTo(padding, y)
    ctx.value.lineTo(width - padding, y)
    ctx.value.stroke()
  }

  // 绘制折线（核心修改）
  ctx.value.beginPath()
  ctx.value.strokeStyle = '#FF5722'
  ctx.value.lineWidth = 3
  ctx.value.lineCap = 'round'
  ctx.value.lineJoin = 'round'

  currentData1.value.forEach((point, index) => {
    const x = padding + (point[0] - xMin) * scaleX
    const y = height - padding - (point[1] - yMin) * scaleY

    if (index === 0) {
      ctx.value.moveTo(x, y)
    } else {
      ctx.value.lineTo(x, y)
    }
  })
  console.log('fin1')
  ctx.value.fillStyle = 'blue'
  currentData2.value.forEach((point, index) => {
    const x = padding + (point[0] - xMin) * scaleX
    const y = height - padding - (point[1] - yMin) * scaleY

    if (index === 0) {
      ctx.value.moveTo(x, y)
    } else {
      ctx.value.lineTo(x, y)
    }
  })
  ctx.value.stroke()

  // 绘制点

  // 绘制标题
  ctx.value.fillStyle = '#2c3e50'
  ctx.value.font = 'bold 18px Arial'
  ctx.value.textAlign = 'center'
  ctx.value.fillText(activeFileName.value, width / 2, 30)

  // 绘制坐标轴标签
  ctx.value.font = '12px Arial'
  ctx.value.fillStyle = '#90a4ae'

  // X轴标签
  ctx.value.textAlign = 'center'
  ctx.value.fillText('X 轴', width / 2, height - 10)

  // Y轴标签
  ctx.value.save()
  ctx.value.translate(15, height / 2)
  ctx.value.rotate(-Math.PI / 2)
  ctx.value.textAlign = 'center'
  ctx.value.fillText('Y 轴', 0, 0)
  ctx.value.restore()
}

// 清除画布
const clearCanvas = () => {
  activeFileIndex.value = -1
  currentData1.value = []
  currentData2.value = []
  if (ctx.value) {
    ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height)
  }
}

// 生成随机数据
const generateRandomData = () => {
  activeFileIndex.value = -1
  currentData1.value = generateSampleData(Math.floor(Math.random() * 100) + 50, 0, 100, 0, 100)
  drawScatterPlot1()
}

// 生成示例数据
function generateSampleData(count, minX, maxX, minY, maxY) {
  const data = []
  for (let i = 0; i < count; i++) {
    const x = minX + Math.random() * (maxX - minX)
    const y = minY + Math.random() * (maxY - minY)
    data.push([x, y])
  }
  return data
}

// 获取当前日期
function getCurrentDate() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

onMounted(() => {
  ctx.value = canvas.value.getContext('2d')
  renewChart()
})

defineExpose({
  renewChart,
  files,
  leftFileList,
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body {
  background-color: white;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}
.containerleft {
  width: 200px;
  height: auto;
  background-color: rgb(20, 9, 241);
  padding-top: 20px;
  padding-right: 20px;
  display: contents;
  position: absolute;
  left: 0px;
  top: 0px;
}
.containerdata {
  width: 1000px;
  max-width: 1400px;
  height: auto;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border-radius: 0px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
  overflow: scroll;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  left: 30px;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.file-list {
  width: 300px;
  background: rgba(10, 15, 40, 0.7);
  padding: 20px;
  overflow-y: auto;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
}

.file-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.file-list h2 {
  color: #4fc3f7;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(79, 195, 247, 0.3);
}

.file-item {
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(79, 195, 247, 0.2);
  position: relative;
}

.file-item:hover {
  background: rgba(40, 60, 120, 0.8);
  transform: translateY(-3px);
  border-color: rgba(79, 195, 247, 0.5);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.file-item.active {
  background: rgba(30, 100, 180, 0.8);
  border-color: #4fc3f7;
}

.file-item h3 {
  color: #fff;
  font-size: 18px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
}

.file-item .edit-icon {
  color: #90a4ae;
  cursor: pointer;
  padding: 2px 5px;
  border-radius: 4px;
  transition: all 0.2s;
}

.file-item .edit-icon:hover {
  background: rgba(79, 195, 247, 0.2);
  color: #4fc3f7;
}

.file-meta {
  display: flex;
  justify-content: space-between;
  color: #90a4ae;
  font-size: 14px;
  margin-top: 10px;
}

.visualization-area {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.canvas-container {
  background: rgba(0, 5, 15, 0.5);
  border-radius: 15px;
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(79, 195, 247, 0.2);
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5);
}

canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.controls {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding: 15px;
  background: rgba(10, 15, 40, 0.7);
  border-radius: 12px;
}

.info-panel {
  color: #e0e0e0;
  flex: 1;
}

.info-panel h3 {
  color: #4fc3f7;
  margin-bottom: 8px;
}

.button-group {
  display: flex;
  gap: 12px;
}

button {
  background: linear-gradient(to right, #2196f3, #21cbf3);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(33, 150, 243, 0.4);
}

button:active {
  transform: translateY(1px);
}

button.secondary {
  background: linear-gradient(to right, #6a11cb, #2575fc);
}

.stats {
  display: flex;
  gap: 20px;
  margin-top: 15px;
  flex-wrap: wrap;
}

.stat-item {
  background: rgba(30, 40, 80, 0.6);
  padding: 10px 15px;
  border-radius: 8px;
  min-width: 120px;
}

.stat-item h4 {
  color: #90a4ae;
  font-size: 14px;
  margin-bottom: 5px;
}

.stat-value {
  color: #4fc3f7;
  font-size: 18px;
  font-weight: bold;
}

.no-data {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #607d8b;
  font-size: 24px;
  text-align: center;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: linear-gradient(135deg, #1a2a6c, #2c387e);
  border-radius: 15px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(79, 195, 247, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h2 {
  color: #4fc3f7;
  font-size: 24px;
}

.close-button {
  background: none;
  border: none;
  color: #90a4ae;
  font-size: 24px;
  cursor: pointer;
  transition: color 0.2s;
}

.close-button:hover {
  color: #ff5722;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: #a0a0ff;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 15px;
  border-radius: 8px;
  border: 1px solid rgba(79, 195, 247, 0.3);
  background: rgba(10, 15, 40, 0.7);
  color: white;
  font-size: 16px;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.file-upload {
  border: 2px dashed rgba(79, 195, 247, 0.5);
  border-radius: 8px;
  padding: 25px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 20px;
}

.file-upload:hover {
  border-color: #4fc3f7;
  background: rgba(79, 195, 247, 0.1);
}

.file-upload p {
  color: #90a4ae;
  margin-top: 10px;
}

.file-upload i {
  font-size: 40px;
  color: #4fc3f7;
  margin-bottom: 10px;
  display: block;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.file-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.file-actions button {
  padding: 6px 12px;
  font-size: 14px;
}

.file-name {
  font-size: 12px;
  color: #4fc3f7;
  margin-top: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

table {
  border-collapse: collapse;
}

thead {
  background: linear-gradient(90deg, #2c3e50, #34495e);
  color: white;
}

th {
  padding: 16px 15px;
  text-align: left;
  font-weight: 600;
  position: relative;
}

th:after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 60%;
  width: 1px;
  background: rgba(255, 255, 255, 0.2);
}

th:last-child:after {
  display: none;
}

tbody tr {
  border-bottom: 1px solid #e0e0e0;
  transition: background-color 0.3s ease;
  cursor: pointer;
}

tbody tr:hover {
  background-color: #f5f7ff !important;
}

tbody tr.highlighted {
  background-color: #ffeb3b !important;
  font-weight: 600;
  animation: highlight-fade 1.5s ease;
}
</style>
