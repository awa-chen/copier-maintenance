<template>
  <div class="min-h-screen bg-gray-50">
    <Login v-if="!store.isLoggedIn" />
    <div v-else class="flex">
      <aside class="w-60 bg-sidebar text-white min-h-screen fixed left-0 top-0 overflow-y-auto flex flex-col" style="background:#1a2332">
        <div class="px-4 py-4 border-b border-white/10 flex items-center gap-3">
          <div class="text-2xl">🖨️</div>
          <div>
            <div class="font-bold text-sm">复印机运维</div>
            <div class="text-xs text-white/40">维修服务系统 v3.1</div>
          </div>
        </div>
        <nav class="flex-1 py-2">
          <router-link
            v-for="item in visibleNavItems" :key="item.path" :to="item.path"
            class="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
            :class="isActive(item.path)
              ? 'bg-white/10 text-white border-l-4 border-blue-500 bg-blue-600/20'
              : 'text-white/60 hover:bg-white/5 hover:text-white border-l-4 border-transparent'">
            <span class="text-base">{{ item.icon }}</span>
            {{ item.label }}
          </router-link>
        </nav>
        <div class="p-4 border-t border-white/10">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">{{ store.user.avatar }}</div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium truncate">{{ store.user.name }}</div>
              <div class="text-xs text-white/40">{{ store.user.role }}</div>
            </div>
            <button @click="logout" class="text-white/40 hover:text-white text-xs">退出</button>
          </div>
        </div>
      </aside>
      <div class="flex-1 ml-60">
        <header class="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
          <div class="text-sm text-gray-500">
            <span class="text-blue-600 font-medium">{{ currentPageName }}</span>
          </div>
          <div class="flex items-center gap-3">
            <button @click="showNotifPanel = !showNotifPanel" class="relative text-gray-400 hover:text-gray-600 transition-colors">
              <span class="text-lg">🔔</span>
              <span v-if="unreadNotif > 0" class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">{{ unreadNotif }}</span>
            </button>
            <router-link to="/profile">
              <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:bg-blue-600 transition">{{ store.user.avatar }}</div>
            </router-link>
          </div>
        </header>
        <main class="p-6">
          <router-view />
        </main>
      </div>
    </div>

    <!-- Toast -->
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <div v-for="t in toasts" :key="t.id"
        :class="['px-4 py-3 rounded-lg text-white text-sm font-medium shadow-lg flex items-center gap-2 animate-slide-in',
          t.type === 'success' ? 'bg-green-500' : t.type === 'error' ? 'bg-red-500' : 'bg-blue-500']">
        {{ t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️' }}
        {{ t.msg }}
      </div>
    </div>

    <!-- Notification Panel -->
    <div v-if="showNotifPanel" class="fixed top-14 right-4 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden" @click.stop>
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div class="text-sm font-semibold text-gray-700">🔔 我的通知</div>
        <button @click="showNotifPanel=false" class="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
      </div>
      <div class="max-h-80 overflow-y-auto">
        <div v-for="n in notifs" :key="n.id"
          :class="['px-4 py-3 border-b border-gray-50 hover:bg-blue-50/50 transition cursor-pointer', !n.read ? 'bg-blue-50/30' : '']"
          @click="n.read=true">
          <div class="flex items-start gap-2">
            <div :class="['w-2 h-2 rounded-full mt-1.5 flex-shrink-0', n.type === 'danger' ? 'bg-red-500' : n.type === 'warn' ? 'bg-orange-400' : 'bg-blue-500']"></div>
            <div class="flex-1">
              <div class="text-sm font-medium text-gray-800">{{ n.title }}</div>
              <div class="text-xs text-gray-400 mt-0.5">{{ n.time }}</div>
            </div>
            <div v-if="!n.read" class="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5"></div>
          </div>
        </div>
        <div v-if="notifs.length === 0" class="py-8 text-center text-gray-400 text-sm">暂无通知</div>
      </div>
      <div class="px-4 py-2 border-t border-gray-100 text-center">
        <button v-if="notifs.some(n=>!n.read)" @click="markAllRead" class="text-xs text-blue-500 hover:text-blue-700">全部标为已读</button>
        <span v-else class="text-xs text-gray-400">全部已读 ✅</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, provide } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from './stores/app'
import Login from './views/Login.vue'

const store = useAppStore()
const route = useRoute()

const navItems = [
  { path: '/dashboard', label: '数据看板', icon: '📊' },
  { path: '/orders', label: '工单管理', icon: '📋' },
  { path: '/inspections', label: '巡检管理', icon: '🔍' },
  { path: '/devices', label: '设备管理', icon: '🖨️', adminOnly: true },
  { path: '/parts', label: '配件管理', icon: '🔧', adminOnly: true },
  { path: '/customers', label: '客户管理', icon: '👥', adminOnly: true },
  { path: '/contracts', label: '合同管理', icon: '📄' },
  { path: '/settlements', label: '结算管理', icon: '💰' },
  { path: '/statistics', label: '数据统计', icon: '📈' },
  { path: '/technicians', label: '账号管理', icon: '👤', adminOnly: true },
  { path: '/profile', label: '个人信息', icon: '⚙️' },
]

function isActive(path) {
  return route.path === path || (path !== '/' && route.path.startsWith(path))
}

const visibleNavItems = computed(() => {
  return navItems.filter(item => {
    if (item.adminOnly && store.user.role !== '管理员') return false
    return true
  })
})

const pageNames = {
  '/dashboard': '数据看板', '/orders': '工单管理', '/inspections': '巡检管理',
  '/devices': '设备管理', '/parts': '配件管理', '/customers': '客户管理',
  '/contracts': '合同管理', '/settlements': '结算管理', '/statistics': '数据统计',
  '/technicians': '账号管理', '/profile': '个人信息',
}
const currentPageName = computed(() => pageNames[route.path] || '')

function logout() { store.isLoggedIn = false }

const showNotifPanel = ref(false)
const notifs = ref([
  { id: 1, title: '工单 W202603001 已创建', time: '2026-03-28 08:30', type: 'info', read: false },
  { id: 2, title: '设备柯美368e报故障', time: '2026-03-28 09:15', type: 'danger', read: false },
  { id: 3, title: '工单 W202603004 待验收', time: '2026-03-28 10:00', type: 'warn', read: false },
  { id: 4, title: '巡检计划 I003 需今日完成', time: '2026-03-28 11:30', type: 'warn', read: true },
])
const unreadNotif = computed(() => notifs.value.filter(n => !n.read).length)
function markAllRead() { notifs.value.forEach(n => n.read = true) }

const toasts = ref([])
let toastId = 0
function showToast(msg, type = 'success') {
  const id = ++toastId
  toasts.value.push({ id, msg, type })
  setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, 3000)
}
provide('showToast', showToast)
</script>

<style>
@keyframes slide-in {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}
.animate-slide-in { animation: slide-in 0.3s ease; }
</style>
