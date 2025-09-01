<template>
  <button @click="test">ceshi</button>
  <div class="canvas-container">
    <div class="info">{{ chosen }}</div>
    <canvas ref="canvas" width="800" height="200"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch} from 'vue'
import { useModelStore } from '@/store/modelStore'
const props = defineProps({
  datain: {
    default: [],
  },

})
const ctx = ref(null)
const canvas = ref('')

const modelStore = useModelStore()

const currentData = modelStore.selectedVariables.length >= props.datain ? 
ref(modelStore.selectedVariables[props.datain].data) : ref([])

const currentTag = modelStore.selectedVariables.length >= props.datain ? 
ref(modelStore.selectedVariables[props.datain].tag) : ref([])


const test = () => {
  console.log(props.datain)
  console.log(currentData.value.length)

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

const xRange = computed(() => {
  if (!currentData.value.length) return [0, 0]
  const xs = currentData.value.map((p) => p[0])
  return [Math.min(...xs), Math.max(...xs)]
})
const yRange = computed(() => {
  if (!currentData.value.length) return [0, 0]
  const ys = currentData.value.map((p) => p[1])
  return [Math.min(...ys), Math.max(...ys)]
})

const drawScatterPlot1 = () => {
  const canvasEl = canvas.value
  const width = canvasEl.width
  const height = canvasEl.height
  const padding = 50
  const xMin = xRange.value[0]
  const xMax = xRange.value[1]
  const yMin = yRange.value[0]
  const yMax = yRange.value[1]
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
  ctx.value.fillStyle = 'blue'
  // 绘制折线（核心修改）
  ctx.value.beginPath()
  ctx.value.strokeStyle = '#FF5722'
  ctx.value.lineWidth = 1
  ctx.value.lineCap = 'round'
  ctx.value.lineJoin = 'round'
  currentData.value.forEach((point, index) => {
    const x = padding + (point[0] - xMin) * scaleX
    const y = height - padding - (point[1] - yMin) * scaleY

    if (index === 0) {
      ctx.value.moveTo(x, y)
    } else {
      ctx.value.lineTo(x, y)
    }
  })
  console.log('fin1')

  ctx.value.stroke()

  // 绘制点

  // 绘制标题
  ctx.value.fillStyle = '#2c3e50'

  // 绘制坐标轴标签
  ctx.value.font = '12px Arial'
  ctx.value.fillStyle = '#90a4ae'

  // X轴标签
  ctx.value.textAlign = 'center'
  ctx.value.fillText('X 轴', width / 2, height - 10)
  ctx.value.fillText(
    xMin.toFixed(1), 
    padding+20, 
    height - padding + 10
  )
 ctx.value.fillText(
    xMax.toFixed(1), 
    width - padding, 
    height - padding + 10
  )
   ctx.value.fillText(
    currentTag.value, 
    width/2 - padding, 
    padding 
  )
  // Y轴标签
  ctx.value.save()
  ctx.value.translate(15, height / 2)
  ctx.value.rotate(-Math.PI / 2)
  ctx.value.textAlign = 'center'
  ctx.value.fillText('Y 轴', 0, 0)
  ctx.value.fillText(
    yMin.toFixed(1), 
    -50, 
    25
    
  )
  
  // Y轴最大值（上端）
  ctx.value.fillText(
    yMax.toFixed(1), 
    padding , 
    padding -20
  )
  ctx.value.restore()
}

onMounted(() => {
  ctx.value = canvas.value.getContext('2d')

  drawScatterPlot1()
})
</script>
