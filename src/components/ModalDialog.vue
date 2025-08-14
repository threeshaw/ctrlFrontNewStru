<template>
  <div class="modal" v-if="visible">
    <div class="modal-content">
      <h3>{{ title }}</h3>
      <slot></slot>
      <div class="modal-buttons">
        <button class="btn-primary" @click="handleConfirm">确定</button>
        <button class="btn-secondary" @click="handleCancel">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
//import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  visible: Boolean,
  title: String
})

const emit = defineEmits(['update:visible', 'confirm', 'cancel'])

const handleConfirm = () => {
  emit('confirm')
  emit('update:visible', false)
}

const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}
</script>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.modal-content {
  background: #fff;
  border-radius: 6px;
  padding: 24px 28px;
  min-width: 300px;
  max-width: 420px;
  box-shadow: 0 4px 20px rgba(0,0,0,.25);
}
.modal-content h3 {
  margin-bottom: 10px;
  font-size: 16px;
}
.modal-content input[type=text], 
.modal-content input[type=file] {
  width: 100%;
  padding: 8px 10px;
  margin: 8px 0 14px;
  border: 1px solid #aaa;
  border-radius: 4px;
}
.modal-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
.btn-primary {
  padding: 6px 12px;
  margin-right: 6px;
  background: #0078d4;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn-secondary {
  padding: 6px 12px;
  background: #ccc;
  color: #000;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>