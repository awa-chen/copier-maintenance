<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
      <div class="text-center mb-8">
        <div class="text-5xl mb-3">🖨️</div>
        <h1 class="text-2xl font-bold text-gray-800">复印机维修运维系统</h1>
        <p class="text-gray-400 text-sm mt-1">请登录您的账号</p>
      </div>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1.5">用户名</label>
          <input v-model="username" type="text" placeholder="请输入用户名" class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" @keyup.enter="login">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1.5">密码</label>
          <input v-model="password" type="password" placeholder="请输入密码" class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" @keyup.enter="login">
        </div>
        <div v-if="error" class="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg">{{ error }}</div>
        <button @click="login" class="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          登录
        </button>
        <div class="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 mt-4">
          <div class="font-medium mb-1 text-gray-600">测试账号：</div>
          <div>管理员：admin / admin</div>
          <div>技术员：zhang / zhang123</div>
          <div>客服：kefu / kefu123</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useAppStore } from '../stores/app'
const store = useAppStore()
const username = ref('')
const password = ref('')
const error = ref('')
function login() {
  error.value = ''
  const u = store.verifyLogin(username.value, password.value)
  if (u) {
    store.user = { name: u.name, role: u.role, phone: u.phone, email: u.email, avatar: u.avatar }
    store.currentUserId = u.id
    store.isLoggedIn = true
  } else {
    error.value = '用户名或密码错误'
  }
}
</script>
