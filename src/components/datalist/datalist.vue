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
      <button @click="test">测试</button>
      <!-- 两种界面 or 一个界面两个选择：可以使用两个绘图？两个模块：在一个格子里叠5个图，两种使用v-if切换 -->
    </div>

    <div class="visualization-area">
      <div class="canvas-container">
        <div class="select-container" v-if="singleShow">
          <button @click="loadFile1(selectedFile1)">reload</button>
          <div class="selection">
            <button @click="zoomOut" :disabled="zoomLevel <= 1">缩小</button>
            <button @click="zoomIn" :disabled="zoomLevel >= 5">放大</button>
            <button @click="resetView">重置视图</button>
            <button @click="toggleMarkerMode" :class="{ active: markerMode }">{{ markerMode ? '标记模式开启' : '标记模式关闭'
              }}</button>
            <canvas ref="canvas" width="700" height="400" @click="handleCanvasClick"></canvas>
            <input type="range" min="0" max="100" v-model="sliderPosition" class="slider"
              @input="updateViewPosition"></input>
              <p>当前x坐标:{{ markIndex }} </p>
          </div>
        </div>

        <div calss="multiContainer" v-if="multiShow">
          <div v-if="multiShow1">
            <tst1 :datain="0"></tst1>
          </div>
          <div v-if="multiShow2">
            <tst1 :datain="1"></tst1>
          </div>
          <div v-if="multiShow3">
            <tst1 :datain="2"></tst1>
          </div>
          <div v-if="multiShow4">
            <tst1 :datain="3"></tst1>
          </div>
        </div>
      </div>

      <div class="controls" v-if="false">
        <div class="info-panel">
          <h3>数据信息</h3>
          <div>
            <div class="stats">
              <div class="stat-item">
                <h4>X轴范围</h4>
                <div class="stat-value">{{ minX }} - {{ maxX }}</div>
              </div>
              <div class="stat-item">
                <h4>Y轴范围</h4>
                <div class="stat-value">{{ minY }} - {{ maxY }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed, watch } from "vue";
import tst1 from "./basicCav.vue";
import { useModelStore } from "@/store/modelStore";


const modelStore = useModelStore();
const multiShow = ref(false);
const singleShow = ref(true);
const changeShowMode = () => {
  multiShow.value = !multiShow.value;
  singleShow.value = !singleShow.value;
};
const canvas = ref(null);
const ctx = ref(null);
const fileInput = ref(null);
const dataInChart = ref([]);
const multiShow1 = ref(false);
const multiShow2 = ref(false);
const multiShow3 = ref(false);
const multiShow4 = ref(false);
const sliderPosition = ref(0)
const visibleDataRange = ref([]);
const visibleDataPoints = ref(0)
//先处理文件可见与不可见部分
// 可见文件数据
const zoomLevel = ref(1)
function getVisibleData() {
  const datatmp = []
  const data1 = modelStore.selectedVariables[0].data
  const totalPoints = data1.length;
  const visibleCount = Math.floor(totalPoints / zoomLevel.value);
  const startIndex = Math.floor(
    (sliderPosition.value / 100) * (totalPoints - visibleCount)
  );

  visibleDataRange.value = [startIndex, startIndex + visibleCount];
  visibleDataPoints.value = visibleCount;
  for (let i = 0; i < modelStore.selectedVariables.length; i++) {
    let pointtmp = modelStore.selectedVariables[i].data.slice(startIndex, startIndex + visibleCount)
    datatmp.push(pointtmp)
  }
  return datatmp;

}

// 放大
function zoomIn() {
  if (zoomLevel.value < 5) {
    zoomLevel.value++;
    drawScatterPlot1();
  }
}

// 缩小
function zoomOut() {
  if (zoomLevel.value > 1) {
    zoomLevel.value--;
    drawScatterPlot1();
  }
}

// 重置视图
function resetView() {
  zoomLevel.value = 1;
  sliderPosition.value = 0;
  selectedPoint.value = null;
  //drawChart();
}

// 切换标记模式
function toggleMarkerMode() {
  markerMode.value = !markerMode.value;
  selectedPoint.value = null;
  //drawChart();
}
const dataToShow = ref([]);
const selectedFile1 = ref("");
const selectedFile2 = ref("");
const multiSelectedFile1 = ref("");
const minX = ref(null);
const maxX = ref(null);
const minY = ref(null);
const maxY = ref(null);
const selectedPoint = ref(null);
const allPointsx = ref([]);
const allPointsy = ref([]);
const calculateBounds = (curvesArray) => {

  // 检查是否有有效数据
  allPointsx.value = [];
  allPointsy.value = [];
  if (!curvesArray || curvesArray.length === 0) {
    return { minX: null, maxX: null, minY: null, maxY: null };
  }

  // 合并所有点

  for (let i = 0; i < curvesArray.length; i++) {
    for (let j = 0; j < curvesArray[0].length; j++) {
      allPointsx.value.push(curvesArray[i][j][0]);
      allPointsy.value.push(curvesArray[i][j][1]);
    }
  }
  console.log(allPointsx.value.length);
  // 检查点数据是否有效

  (minX.value = Math.min(...allPointsx.value)),
    (maxX.value = Math.max(...allPointsx.value)),
    (minY.value = Math.min(...allPointsy.value)),
    (maxY.value = Math.max(...allPointsy.value));
  //console.log(maxY.value)
};
const leftFileList = ref([]);
const test = () => {

  for (let i = 0; i < modelStore.selectedVariables.length; i++) {
    dataToShow.value.push(modelStore.selectedVariables[i].data); //所有需要绘图数组
    leftFileList.value.push(modelStore.selectedVariables[i].tag); //所有绘制的tag
  }

  //console.log(minX.value)
  multiShow1.value = dataToShow.value.length > 0 ? true : false;
  multiShow2.value = dataToShow.value.length > 1 ? true : false;
  multiShow3.value = dataToShow.value.length > 2 ? true : false;
  multiShow4.value = dataToShow.value.length > 3 ? true : false;
};

const activeFileIndex = ref(-1);
const colorChoice = ["yellow", "blue", "black", "green", "red"];

const renewChart = () => {
  leftFileList.value = [];
  dataInChart.value = [];
  dataToShow.value = [];
  for (let i = 0; i < modelStore.selectedVariables.length; i = i + 1) {
    leftFileList.value.push(modelStore.selectedVariables.tag);
  }
};
// 新文件数据模型

const activeFileName = computed(() => {
  return activeFileIndex.value >= 0
    ? files.value[activeFileIndex.value].name
    : "";
});

// 加载文件数据
const loadFile1 = () => {
  drawScatterPlot1();
};

function drawCurve(color, points, padding, height, scaleX, scaleY) {
  ctx.value.beginPath(); // 开始新路径
  let maxIndex = points.length
  for (let index = 0; index < maxIndex; index++) {
    const x = padding + (points[index][0] - minX.value) * scaleX;
    const y = height - padding - (points[index][1] - minY.value) * scaleY;
    if (index === 0) {
      ctx.value.moveTo(x, y);
    } else {
      ctx.value.lineTo(x, y);
    }
  }

  ctx.value.strokeStyle = color; // 设置线条颜色
  ctx.value.lineWidth = 1; // 设置线条宽度
  ctx.value.stroke(); // 绘制曲线
}
// 绘制散点图1
const drawScatterPlot1 = () => {
  ctx.value = canvas.value.getContext("2d");
  calculateBounds(getVisibleData());
  const canvasEl = canvas.value;
  const width = canvasEl.width;
  const height = canvasEl.height;
  const padding = 20;

  // 计算比例因子
  let pointsToDraw = getVisibleData()
  let scaleX = (width - 2 * padding) / (maxX.value - minX.value);
  let scaleY = (height - 2 * padding) / (maxY.value - minY.value);

  // 设置画布尺寸

  ctx.value.clearRect(0, 0, canvasEl.width, canvasEl.height);

  // 设置画布尺寸

  // 绘制坐标轴
  ctx.value.strokeStyle = "#4fc3f7";
  ctx.value.lineWidth = 2;
  ctx.value.beginPath();
  ctx.value.moveTo(padding, padding);
  ctx.value.lineTo(width - padding, padding);
  ctx.value.lineTo(width - padding, height - padding);
  ctx.value.lineTo(padding, height - padding);
  ctx.value.lineTo(padding, padding);

  // ctx.value.moveTo(width - padding + 10, padding - 10);
  // ctx.value.lineTo(width - padding - 40, padding - 10);
  // ctx.value.lineTo(width - padding - 40, padding + 30);
  // ctx.value.lineTo(width - padding + 10, padding + 30);
  // ctx.value.lineTo(width - padding + 10, padding - 10);
  ctx.value.stroke();

  // 绘制网格
  ctx.value.strokeStyle = "rgba(79, 195, 247, 0.2)";
  ctx.value.lineWidth = 1;

  // X轴网格
  for (let i = 1; i < 10; i++) {
    const x = padding + (i * (width - 2 * padding)) / 10;
    ctx.value.beginPath();
    ctx.value.moveTo(x, padding);
    ctx.value.lineTo(x, height - padding);
    ctx.value.stroke();
  }

  // Y轴网格
  for (let i = 1; i < 10; i++) {
    const y = padding + (i * (height - 2 * padding)) / 10;
    ctx.value.beginPath();
    ctx.value.moveTo(padding, y);
    ctx.value.lineTo(width - padding, y);
    ctx.value.stroke();
  }

  // 绘制折线（核心修改）
  ctx.value.beginPath();

  ctx.value.lineWidth = 1;
  ctx.value.lineCap = "round";
  ctx.value.lineJoin = "round";
  if (dataToShow.value.length > 0) {
    let basiclabel = [width - padding, padding - 10];
    for (let i = 0; i < pointsToDraw.length; i++) {
      drawCurve(
        colorChoice[i % 5],
        pointsToDraw[i],
        padding,
        height,
        scaleX,
        scaleY
      );
      ctx.value.fillStyle = colorChoice[i % 5];
      ctx.value.font = "bold 12px Arial";
      ctx.value.textAlign = "center";
      console.log(leftFileList.value[i]);
      ctx.value.fillText(
        leftFileList.value[i],
        basiclabel[0],
        basiclabel[1] - 10 * i
      );
    }
  }
  if (markerMode.value) {
    ctx.value.beginPath();
    let realx = padding + (markIndex.value - minX.value) * scaleX
          ctx.value.strokeStyle = '#e74c3c';
          ctx.value.lineWidth = 2;
          ctx.value.setLineDash([5, 5]);
          ctx.value.moveTo(realx, padding);
          ctx.value.lineTo(realx, height-padding);
          ctx.value.stroke();
          ctx.value.setLineDash([]);
  }
  // 绘制标题
  ctx.value.fillStyle = "#2c3e50";
  ctx.value.font = "bold 18px Arial";
  ctx.value.textAlign = "center";
  ctx.value.fillText(activeFileName.value, width / 2, 30);

  // 绘制坐标轴标签
  ctx.value.font = "12px Arial";
  ctx.value.fillStyle = "#90a4ae";

  // X轴标签
  ctx.value.textAlign = "center";
  ctx.value.fillText("X 轴", width / 2, height - 10);
  ctx.value.fillStyle = "green";
  ctx.value.fillText(minX.value, padding + 5, height - padding + 10);
  ctx.value.fillText(maxX.value, width - padding - 10, height - padding + 10);
  // Y轴标签
  ctx.value.save();
  ctx.value.translate(15, height / 2);
  ctx.value.rotate(-Math.PI / 2);
  ctx.value.textAlign = "center";
  ctx.value.fillText("Y 轴", 0, 0);
  ctx.value.fillText(minY.value, -height / 2 + padding, padding - 20);
  ctx.value.fillText(maxY.value, height / 2 - padding, padding - 20);
  ctx.value.restore();
  // if(markerMode.value){
  //   ctx.value.moveTo()
  // }
};

const markerMode = ref(true)
const markIndex = ref(null)
function handleCanvasClick(event) {
  if (!markerMode.value) return;

  const rect = canvas.value.getBoundingClientRect();
  const x = event.clientX - rect.left-25;
  const width = canvas.value.width;
  const visibleData = getVisibleData();
  if (visibleData.length === 0) return;

  // 找到最近的数据点
  markIndex.value = Math.round((x / (890)) * (visibleData[0].length - 1));
  console.log(markIndex.value)
  drawScatterPlot1()
}

watch(() => zoomLevel.value,
  () => {
    drawScatterPlot1()
    console.log(sliderPosition.value)
  },
  { deep: false });
function updateViewPosition() {
  drawScatterPlot1();
}

// 清除画布
const clearCanvas = () => {
  activeFileIndex.value = -1;

  if (ctx.value) {
    ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
  }
};



// 获取当前日期
function getCurrentDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")}`;
}

onMounted(() => {
  test();
  loadFile1();
});

defineExpose({});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
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
  content: "";
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
