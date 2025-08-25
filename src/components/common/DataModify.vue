<template>
  <div class="modal" v-if="props.visible">
    <div class="modal-content">
      <h3>文件操作</h3>
      <div class="file-upload-area">
        <p>原始数据</p>
        <select v-model="selectedFile">
          <option v-for="(value,index) in filelist" :key="index" :value="index">
            {{ value }}
          </option>
        </select>
        <p>新标签</p>
        <input placeholder="" v-model="newtag"></input>
        <p>新属性</p>
        <input placeholder=""></input>
        
        <div>
          <p>操作</p>
          <select v-model="calMethod">
          <option v-for="(value,index) in optionList" :key="index" :value="index">
            {{ value }}
          </option>
        </select>
        <p>操作数</p>
        <input placeholder="" v-model="numIn"></input>
      </div>
        <button @click="test">confirm</button>
      </div>
      
      
      <div class="modal-actions">
        <button class="btn-secondary" @click="close">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref,onMounted ,computed,watch} from 'vue'
import { useModelStore } from '@/store/modelStore'

const modelStore = useModelStore()
const filelist = ref([])
const selectedFile = ref(0)
const calMethod = ref(null)
const newtag = ref([])
const numIn = ref(1)
const fileToCal = computed(()=>{
  return modelStore.variables[selectedFile.value]
})

const emit = defineEmits('stopvis')
const close = () => {
  emit('stopvis')
}
const init = () =>{
  filelist.value = []
  for (let i = 0;i < modelStore.variables.length;i++){
  filelist.value.push(modelStore.variables[i].tag)
  
}

}



const test = () =>{

  const newVar = {
    id: fileToCal.value.id+'_new',
    tag: newtag.value,
    description: '',
    unit: fileToCal.value.unit,
    rangeHigh: 0,
    rangeLow: 0,
    property: fileToCal.value.property,
    data:fileToCal.value.data,
    IOtype:'undefined',//define：
  }
  if(calMethod.value === '1'){
    newVar.data = addre(fileToCal.value.data,numIn.value)
  }
  modelStore.addNewVar(newVar)

  init()
  emit('stopvis')
}
const optionList = ['add','decrease','plus','add with','decrease with']
const props = defineProps({
  visible: Boolean
})

watch(() => modelStore.variables,()=>{
  init()
},{deep:true,immediate:true})

const addre = (datain,a1) =>{
  let num = datain.length
  let datain1 = datain
  for (let i = 0;i<num;i++){
    datain1[i][1] = datain[i][1] + a1
  }
  return datain1
}



onMounted(() => {
  init()
})
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