<template>
  <div class="menubar">
    <span id="fileBtn" @click="toggleFileMenu">
      文件(File) ▼
      <ul v-show="fileMenuVisible" class="dropdown" id="fileMenu">
        <li @click="showModal('newProject')">新建(N)</li>
        <li @click="showModal('openProject')">打开(O)</li>
        <li @click="saveProject">保存(S)</li>
        <li @click="showModal('saveAsProject')">另存为(Sa)</li>
        <li @click="showCurrentPath">显示当前位置</li>
        <li @click="exitApp">退出(X)</li>
      </ul>
    </span>
    <span id="helpBtn" @click="toggleHelp">帮助(Help)</span>
    <span id="helpTip" v-show="helpVisible">2025版SIA-APC软件</span>

    <!-- 新建工程模态框 -->
   
    <ModalDialog 
      v-model:visible="modals.newProject" 
      title="新建工程"
      @confirm="createProject"
      @cancel="closeModal('newProject')"
    >
      <div class="form-group">
        <label>工程名称</label>
        <input v-model="projectName" type="text" placeholder="例如：HO701" />
      </div>
      <div class="form-group">
        <label>工程描述</label>
        <input v-model="projectDesc" type="text" placeholder="例如：精馏塔建模与优化" />
      </div>
    </ModalDialog>
    

    <!-- 打开工程模态框 -->
    <ModalDialog 
      v-model:visible="modals.openProject" 
      title="打开工程"
      @confirm="openProject"
      @cancel="closeModal('openProject')"
    >
      <input type="file" id="filePicker" />
    </ModalDialog>

    <!-- 另存为模态框 -->
    <ModalDialog 
      v-model:visible="modals.saveAsProject" 
      title="另存为"
      @confirm="doSaveAs"
      @cancel="closeModal('saveAsProject')"
    >
      <input v-model="saveAsName" type="text" placeholder="文件名.ho701" />
    </ModalDialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/authStore'
import ModalDialog from '@/components/ModalDialog.vue'

// 菜单状态
const fileMenuVisible = ref(false)
const helpVisible = ref(false)

// 模态框状态
const modals = ref({
  newProject: false,
  openProject: false,
  saveAsProject: false
})

// 表单数据
const projectName = ref('')
const projectDesc = ref('')
const saveAsName = ref('')

// 状态管理和路由
const router = useRouter()
const authStore = useAuthStore()

// 菜单切换功能
const toggleFileMenu = (e) => {
  e.stopPropagation()
  fileMenuVisible.value = !fileMenuVisible.value
}

const toggleHelp = () => {
  helpVisible.value = !helpVisible.value
}

// 模态框控制
const showModal = (modalName) => {
  fileMenuVisible.value = false
  modals.value[modalName] = true
}

const closeModal = (modalName) => {
  modals.value[modalName] = false
}

// 项目操作功能
const createProject = () => {
  if (!projectName.value.trim()) {
    alert('请输入工程名称！')
    return
  }
  
  // alert(`已创建工程：${projectName.value}`)
  // authStore.setProjectSaved(false)
  // closeModal('newProject')
  
  // 在实际应用中，这里应该导航到主工作区  跳转到辨识界面中。
  router.push({ name: 'model-identification' })
  
  // 示例中跳转到测试页面
//   window.location.href = 'test_02_辨识.html'
}

const saveProject = () => {
  alert('工程已保存！')
  authStore.setProjectSaved(true)
}

const doSaveAs = () => {
  if (!saveAsName.value.trim()) {
    alert('请输入文件名！')
    return
  }
  
  alert(`已另存为：${saveAsName.value}`)
  authStore.setProjectSaved(true)
  closeModal('saveAsProject')
}

const openProject = () => {
  const fileInput = document.getElementById('filePicker')
  if (fileInput.files.length === 0) {
    alert('请选择工程文件！')
    return
  }
  
  const fileName = fileInput.files[0].name
  alert(`已打开工程：${fileName}`)
  closeModal('openProject')
  
  // 在实际应用中，这里应该加载工程数据并导航到主工作区
  // router.push({ name: 'workspace' })
}

const showCurrentPath = () => {
  alert('当前位置：' + window.location.href)
}

// 退出应用功能
const exitApp = () => {
  if (authStore.projectSaved) {
    safeExit()
  } else {
    const ok = confirm('当前工程尚未保存，是否保存后再退出？')
    if (ok) {
      saveProject()
    }
    safeExit()
  }
}

const safeExit = () => {
  authStore.logout()
  router.push({ name: 'login' })
}

// 点击页面其他地方关闭文件菜单
const closeFileMenu = (e) => {
  if (!e.target.closest('#fileBtn')) {
    fileMenuVisible.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeFileMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeFileMenu)
})
</script>

<style scoped>
.menubar {
  display: flex;
  align-items: center;
  background: linear-gradient(to bottom, #f5f5f5, #ddd);
  border-bottom: 1px solid #bbb;
  padding: 0 12px;
  height: 38px;
  user-select: none;
  position: relative;
}

.menubar > span {
  margin-right: 22px;
  cursor: pointer;
  font-size: 14px;
  position: relative;
}

.menubar > span:hover {
  color: #0078d4;
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  background: #fff;
  border: 1px solid #ccc;
  box-shadow: 0 2px 6px rgba(0,0,0,.25);
  z-index: 999;
  min-width: 160px;
}

.dropdown li {
  list-style: none;
  padding: 8px 14px;
  cursor: pointer;
  font-size: 13px;
}

.dropdown li:hover {
  background: #f0f0f0;
}

/* 新增表单组样式 */
.form-group {
  display: block;
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #aaa;
  border-radius: 4px;
  font-size: 14px;
}

#helpTip {
  position: absolute;
  top: 38px;
  left: 70px;
  background: #fffbe6;
  border: 1px solid #e2c822;
  padding: 6px 10px;
  font-size: 12px;
  z-index: 1000;
  white-space: nowrap;
}
</style>