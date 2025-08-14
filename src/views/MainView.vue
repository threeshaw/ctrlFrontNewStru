<template>
  <div class="main-view">
    <TopMenuBar />
    <!-- <div id="mainUI">
      <h2>欢迎使用 SIA-APC 先进控制与优化工程软件</h2>
    </div> -->
    
    <!-- 模态框占位 -->
    <!-- 实际项目中，这里会根据状态显示不同的模态框 -->
  </div>

  <div id="workspace">
    <div v-if="!currentPage || currentPage === '欢迎使用 SIA-APC – 先进控制与优化工程软件'" class="welcome-screen">
      <div class="welcome-header">
        <h1>SIA-APC – 先进控制与优化工程软件</h1>
        <!-- <p>请通过顶部菜单操作,或下方快捷方式进入工程</p> -->
      </div>
      
      <div class="dashboard">
        <div class="dashboard-card">
          <h3>最近工程</h3>
          <div v-for="project in recentProjects" :key="project.id" class="project-item">
            <div class="project-icon">📁</div>
            <div class="project-info">
              <div class="project-name">{{ project.name }}</div>
              <div class="project-date">{{ project.date }}</div>
            </div>
          </div>
          <button class="btn-new-project" @click="NewProject">新建工程</button>
          <!-- <button @click="showModal('newProject')">新建工程</button> -->
           <!-- <li @click="showModal('newProject')">新建(N)</li> -->
        </div>
      
        <div class="dashboard-card">
          <h3>快速开始</h3>
          <div class="quick-links">
            <button @click="showPage('导入数据')">导入数据</button>
            <button @click="showPage('模型辨识')">模型辨识</button>
            <button @click="showPage('仿真测试')">仿真测试</button>
            <button @click="showPage('帮助文档')">帮助文档</button>
          </div>
        </div>
        
        <div class="dashboard-card">
          <h3>系统状态</h3>
          <div class="system-status">
            <div><span>当前用户:</span> {{ currentUser }}</div>
            <div><span>工程状态:</span> {{ projectStatus }}</div>
            <div><span>上次保存:</span> {{ lastSaved }}</div>
            <!-- <div><span>内存使用:</span> 1.2GB / 4.0GB</div> -->
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 新建工程模态框 -->
   
    <!-- <ModalDialog 
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
    </ModalDialog> -->

</template>

<script setup>
import TopMenuBar from '@/components/TopMenuBar.vue'

import { ref, computed } from 'vue'
import { useModelStore } from '@/store/modelStore'
import { useAuthStore } from '@/store/authStore'

// import { useRouter } from 'vue-router'
import ModalDialog from '@/components/ModalDialog.vue'



const props = defineProps({
  currentPage: String
})

const modelStore = useModelStore()
const authStore = useAuthStore()
const recentProjects = ref([
  { id: 1, name: 'HO701 - 精馏塔优化', date: '2025-08-08' },
  { id: 2, name: 'HO702 - 反应器控制', date: '2025-08-08' }
])

const currentUser = computed(() => authStore.user || '未登录')
const projectStatus = ref('已保存')
const lastSaved = ref('2025-08-08 14:30:22')
const showPage = (pageName) => {
  modelStore.setCurrentPage(pageName)
}

// const createNewProject = () => {
//   modelStore.setCurrentPage('新建工程')
// }

// 状态管理和路由
// const router = useRouter()

// 项目操作功能
// const createProject = () => {
//   if (!projectName.value.trim()) {
//     alert('请输入工程名称！')
//     return
//   }
  
//   alert(`已创建工程：${projectName.value}`)
//   authStore.setProjectSaved(false)
//   closeModal('newProject')
  
  // 在实际应用中，这里应该导航到主工作区  跳转到辨识界面中。
  // router.push({ name: 'model-identification' })
  
  // 示例中跳转到测试页面
//   window.location.href = 'test_02_辨识.html'
// }


</script>

<style scoped>
/* #mainUI {
  padding: 20px;
  font-size: 15px;
} */

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

.system-status div {
  padding: 5px 0;
}

.system-status span {
  font-weight: 500;
  display: inline-block;
  width: 80px;
  color: #555;
} 


</style>