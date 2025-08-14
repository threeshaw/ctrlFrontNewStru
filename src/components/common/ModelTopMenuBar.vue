<template>
  <div class="menubar">
    <span id="mFile" @click="toggleDropdown('file')">
      文件
      <ul v-show="activeDropdown === 'file'" class="dropdown">
        <li @click="newProject">新建工程</li>
        <li @click="openProject">打开工程</li>
        <li @click="saveProject">保存</li>
        <li @click="saveAsProject">另存为</li>
        <li @click="exitApp">退出</li>
      </ul>
    </span>
    <span id="Edit" @click="toggleDropdown('edit')">
      编辑
       <ul v-show="activeDropdown === 'edit'" class="dropdown">
        <li @click="showPage('导入数据')">导入数据</li>
        <li @click="showPage('导出数据')">导出数据</li>
        <li @click="showPage('删除变量')">删除变量</li>
        <li @click="showPage('新增变量')">新增变量</li>
        <li @click="showPage('修改变量')">修改变量</li>
      </ul>
    </span>
    <span id="View" @click="toggleDropdown('view')">
      视图
        <ul v-show="activeDropdown === 'view'" class="dropdown">
        <li @click="showPage('过程变量')">过程变量</li>
        <li @click="showPage('过程曲线')">过程曲线</li>
        <li @click="showPage('过程模型')">过程模型</li>
        <li @click="showPage('过程模拟')">过程模拟</li>
      </ul>
    </span>
    <!-- <span id="mData" @click="toggleDropdown('data')">
      数据管理
      <ul v-show="activeDropdown === 'data'" class="dropdown">
        <li @click="showPage('导入数据')">导入数据</li>
        <li @click="showPage('导出数据')">导出数据</li>
      </ul>
    </span> -->
        <span id="mModel" @click="toggleDropdown('model')">
      模型
      <ul v-show="activeDropdown === 'model'" class="dropdown">
        <li @click="showPage('模型辨识')">模型辨识</li>
        <li @click="showPage('导出模型')">导出模型</li>
        <li @click="showPage('导入模型')">导入模型</li>
      </ul>
    </span>
    <span id="helpBtn" @click="toggleDropdown('help')">
      帮助
        <ul v-show="activeDropdown === 'help'" class="dropdown">
        <li @click="showPage('2025版SIA-APC软件')">2025版SIA-APC软件</li>
      </ul>
    </span>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { onMounted } from 'vue'
import { onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useModelStore } from '@/store/modelStore'

const activeDropdown = ref(null)
const router = useRouter()
const modelStore = useModelStore()

const toggleDropdown = (menu) => {
  activeDropdown.value = activeDropdown.value === menu ? null : menu
}

const showPage = (pageName) => {
  modelStore.setCurrentPage(pageName)
  activeDropdown.value = null
}

const newProject = () => {
  router.push({ name: 'main' })
}

const openProject = () => {
  alert('打开工程功能')
}

const saveProject = () => {
  alert('保存工程功能')
}

const saveAsProject = () => {
  alert('另存为功能')
}

const exitApp = () => {
  router.push({ name: 'login' })
}

// 点击页面其他地方关闭下拉菜单
const closeDropdowns = (e) => {
  if (!e.target.closest('.menubar > span')) {
    activeDropdown.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdowns)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdowns)
})
</script>

<style scoped>
.menubar {
  display: flex;
  background: #fafafa;
  border-bottom: 1px solid #ccc;
  height: 36px;
  align-items: center;
  padding: 0 12px;
  user-select: none;
}

.menubar > span {
  position: relative;
  margin-right: 22px;
  font-size: 14px;
  cursor: pointer;
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
  z-index: 999;
  min-width: 160px;
}

.dropdown li {
  list-style: none;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
}

.dropdown li:hover {
  background: #e6f3ff;
}

</style>