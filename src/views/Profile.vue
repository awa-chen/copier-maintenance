<template>
  <div class="max-w-2xl space-y-5">
    <!-- Profile Card -->
    <div class="bg-white rounded-xl shadow-sm p-6">
      <div class="flex items-center gap-5 mb-6 pb-6 border-b">
        <div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">{{ store.user.avatar }}</div>
        <div>
          <h2 class="text-lg font-bold text-gray-800">{{ store.user.name }}</h2>
          <p class="text-sm text-gray-400">{{ store.user.role }}</p>
          <p class="text-sm text-blue-500 mt-1">{{ store.user.email }}</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-gray-200 mb-5">
        <button v-for="tab in tabs" :key="tab.id"
          @click="activeTab = tab.id"
          :class="activeTab === tab.id
            ? 'px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px text-blue-600 border-blue-600'
            : 'px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px text-gray-400 border-transparent hover:text-gray-600'">
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab: 个人信息 -->
      <div v-if="activeTab === 'info'" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">姓名</label>
            <input v-model="form.name" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">角色</label>
            <input :value="store.user.role" readonly class="w-full px-3 py-2 border border-gray-100 rounded-lg text-sm bg-gray-50 text-gray-400">
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">手机</label>
            <input v-model="form.phone" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">邮箱</label>
            <input v-model="form.email" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">头像文字（1个字符）</label>
          <input v-model="form.avatar" maxlength="1" class="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        <button @click="saveInfo" class="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">保存修改</button>
      </div>

      <!-- Tab: 修改密码 -->
      <div v-if="activeTab === 'password'" class="space-y-4 max-w-sm">
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">当前密码</label>
          <input v-model="pwd.old" type="password" placeholder="请输入当前密码" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">新密码</label>
          <input v-model="pwd.new" type="password" placeholder="请输入新密码" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">确认新密码</label>
          <input v-model="pwd.confirm" type="password" placeholder="再次输入新密码" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        <button @click="changePwd" class="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">修改密码</button>
      </div>

      <!-- Tab: 通知设置 -->
      <div v-if="activeTab === 'notify'" class="space-y-1">
        <div v-for="item in notifyItems" :key="item.key" class="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
          <div>
            <div class="text-sm font-medium text-gray-700">{{ item.label }}</div>
            <div class="text-xs text-gray-400 mt-0.5">{{ item.desc }}</div>
          </div>
          <button @click="toggleNotify(item.key)"
            :class="['w-11 h-6 rounded-full transition-colors relative',
              store.user[item.key] ? 'bg-blue-500' : 'bg-gray-200']">
            <span :class="['w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow',
              store.user[item.key] ? 'translate-x-5' : 'translate-x-0.5']"></span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, inject } from 'vue'
import { useAppStore } from '../stores/app'
const store = useAppStore()
const showToast = inject('showToast')

const tabs = [
  { id: 'info', label: '个人资料' },
  { id: 'password', label: '修改密码' },
  { id: 'notify', label: '通知设置' },
]
const activeTab = ref('info')

const form = reactive({ ...store.user })
const pwd = reactive({ old: '', new: '', confirm: '' })

const notifyItems = [
  { key: 'nOrder', label: '工单通知', desc: '有新工单创建或状态变更时通知' },
  { key: 'nDevice', label: '设备告警', desc: '设备出现故障时通知' },
  { key: 'nReport', label: '巡检报告', desc: '巡检报告生成后通知' },
]

function saveInfo() {
  Object.assign(store.user, form)
  showToast('个人资料已保存')
}

function changePwd() {
  if (!pwd.old) { showToast('请输入当前密码', 'error'); return }
  if (!pwd.new) { showToast('请输入新密码', 'error'); return }
  if (pwd.new !== pwd.confirm) { showToast('两次密码不一致', 'error'); return }
  if (pwd.new.length < 6) { showToast('密码长度至少6位', 'error'); return }
  showToast('密码修改成功')
  pwd.old = ''; pwd.new = ''; pwd.confirm = ''
}

function toggleNotify(key) {
  store.user[key] = !store.user[key]
}
</script>
