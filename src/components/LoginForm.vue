<template>
  <form id="loginForm" @submit.prevent="handleSubmit">
    <h2>SIA-APC 登录</h2>
    <label>用户名</label>
    <input v-model="username" type="text" placeholder="请输入用户名" required />
    <label>密码</label>
    <input v-model="password" type="password" placeholder="请输入密码" required />
    <button type="submit">登 录</button>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/authStore'

const username = ref('')
const password = ref('')
const router = useRouter()
const authStore = useAuthStore()

const handleSubmit = () => {
  if (authStore.login(username.value, password.value)) {
    router.push({ name: 'main' })
  } else {
    alert('用户名或密码错误！')
  }
}
</script>

<style scoped>
#loginForm {
  width: 320px;
  margin: 120px auto;
  border: 1px solid #bbb;
  border-radius: 6px;
  padding: 30px 40px 40px;
  box-shadow: 0 4px 12px rgba(0,0,0,.15);
  transition: opacity .4s;
}
#loginForm h2 {
  margin-bottom: 26px;
  text-align: center;
  font-weight: 600;
  color: #333;
}
#loginForm input {
  width: 100%;
  padding: 10px 12px;
  margin: 8px 0 20px;
  border: 1px solid #aaa;
  border-radius: 4px;
  font-size: 14px;
}
#loginForm button {
  width: 100%;
  padding: 10px;
  background: #0078d4;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 15px;
  cursor: pointer;
}
#loginForm button:hover {
  background: #106ebe;
}
</style>