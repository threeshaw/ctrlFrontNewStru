<template>
  <div class="login-view">
    <LoginForm />
  </div>
</template>

<script setup>
import LoginForm from '@/components/LoginForm.vue'
</script>

<style scoped>
.login-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>