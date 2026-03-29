<template>
  <div class="space-y-5 animate-fade-in">
    <!-- Stats -->
    <div class="grid grid-cols-4 gap-4">
      <div v-for="s in stats" :key="s.label"
        class="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
        @click="$router.push(s.path)">
        <div :class="['w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0', s.iconBg]">{{ s.icon }}</div>
        <div>
          <div class="text-2xl font-bold text-gray-800" style="font-family: monospace">{{ s.value }}</div>
          <div class="text-xs text-gray-400 mt-0.5">{{ s.label }}</div>
        </div>
      </div>
    </div>

    <!-- Charts & Lists -->
    <div class="grid grid-cols-3 gap-4">
      <!-- Order Status Chart -->
      <div class="bg-white rounded-xl shadow-sm p-5 col-span-2">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-700">📊 工单状态分布</h3>
        </div>
        <div class="flex gap-6 items-center">
          <div class="relative w-28 h-28 flex-shrink-0">
            <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" stroke-width="12"/>
              <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" stroke-width="12"
                :stroke-dasharray="`${donePct*2.51} 251`" stroke-linecap="round"/>
              <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" stroke-width="12"
                :stroke-dasharray="`${pendingPct*2.51} 251`" :stroke-dashoffset="`-${donePct*2.51}`" stroke-linecap="round"/>
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-lg font-bold">{{ store.orders.length }}</span>
              <span class="text-[10px] text-gray-400">全部</span>
            </div>
          </div>
          <div class="flex-1 space-y-3">
            <div v-for="item in statusLegend" :key="item.label" class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-sm flex-shrink-0" :class="item.color"></div>
              <span class="text-sm text-gray-600 flex-1">{{ item.label }}</span>
              <span class="text-sm font-bold font-mono">{{ item.count }}</span>
              <span class="text-xs text-gray-400 w-10 text-right">{{ item.pct }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Priority Alert -->
      <div class="bg-white rounded-xl shadow-sm p-5">
        <h3 class="font-semibold text-gray-700 mb-4">⚠️ 紧急工单</h3>
        <div class="space-y-3">
          <div v-for="o in urgentOrders" :key="o.id"
            class="p-3 bg-red-50 rounded-lg border border-red-100 cursor-pointer hover:bg-red-100 transition"
            @click="$router.push('/orders')">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-mono text-blue-500">{{ o.id }}</span>
              <span class="text-xs text-red-500 font-medium">紧急</span>
            </div>
            <div class="text-sm font-medium text-gray-700">{{ o.title }}</div>
            <div class="text-xs text-gray-400 mt-1">{{ store.getCustomerName(o.customer) }}</div>
          </div>
          <div v-if="urgentOrders.length === 0" class="text-center py-6 text-gray-400 text-sm">暂无紧急工单 ✅</div>
        </div>
      </div>
    </div>

    <!-- Recent Orders -->
    <div class="bg-white rounded-xl shadow-sm">
      <div class="flex items-center justify-between p-5 pb-3">
        <h3 class="font-semibold text-gray-700">📋 最近工单</h3>
        <router-link to="/orders" class="text-sm text-blue-500 hover:underline">查看全部 →</router-link>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-xs text-gray-400 uppercase border-b">
              <th class="px-5 pb-2 font-medium">工单号</th>
              <th class="px-5 pb-2 font-medium">标题</th>
              <th class="px-5 pb-2 font-medium">客户</th>
              <th class="px-5 pb-2 font-medium">设备</th>
              <th class="px-5 pb-2 font-medium">优先级</th>
              <th class="px-5 pb-2 font-medium">状态</th>
              <th class="px-5 pb-2 font-medium">技术员</th>
              <th class="px-5 pb-2 font-medium">日期</th>
            </tr>
          </thead>
          <tbody class="text-gray-700">
            <tr v-for="o in recentOrders" :key="o.id" class="border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer" @click="$router.push('/orders')">
              <td class="px-5 py-3 font-mono text-xs text-blue-600">{{ o.id }}</td>
              <td class="px-5 py-3 font-medium">{{ o.title }}</td>
              <td class="px-5 py-3">{{ store.getCustomerName(o.customer) }}</td>
              <td class="px-5 py-3 text-xs">{{ store.getDeviceName(o.device) }}</td>
              <td class="px-5 py-3"><span :class="['inline-block px-2 py-0.5 rounded-full text-xs font-medium', store.priorityClass(o.priority)]">{{ o.priority }}</span></td>
              <td class="px-5 py-3"><span :class="['inline-block px-2 py-0.5 rounded-full text-xs font-medium', store.badgeClass(o.status)]">{{ o.status }}</span></td>
              <td class="px-5 py-3"><span v-if="!o.assignee" class="text-gray-300">未派</span>{{ o.assignee }}</td>
              <td class="px-5 py-3 text-xs text-gray-400">{{ o.created }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Devices Overview -->
    <div class="bg-white rounded-xl shadow-sm">
      <div class="flex items-center justify-between p-5 pb-3">
        <h3 class="font-semibold text-gray-700">🖨️ 设备状态</h3>
        <router-link to="/devices" class="text-sm text-blue-500 hover:underline">查看全部 →</router-link>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-xs text-gray-400 uppercase border-b">
              <th class="px-5 pb-2 font-medium">型号</th>
              <th class="px-5 pb-2 font-medium">序列号</th>
              <th class="px-5 pb-2 font-medium">客户</th>
              <th class="px-5 pb-2 font-medium">位置</th>
              <th class="px-5 pb-2 font-medium">状态</th>
            </tr>
          </thead>
          <tbody class="text-gray-700">
            <tr v-for="d in store.devices.slice(0,6)" :key="d.id" class="border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer" @click="$router.push('/devices')">
              <td class="px-5 py-3 font-medium">{{ d.model }}</td>
              <td class="px-5 py-3 font-mono text-xs text-gray-400">{{ d.sn }}</td>
              <td class="px-5 py-3">{{ store.getCustomerName(d.customer) }}</td>
              <td class="px-5 py-3 text-xs">{{ d.addr }}</td>
              <td class="px-5 py-3"><span :class="['inline-block px-2 py-0.5 rounded-full text-xs font-medium', store.badgeClass(d.status)]">{{ d.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '../stores/app'
const store = useAppStore()

const stats = computed(() => {
  const vo = store.visibleOrders
  const today = new Date().toISOString().slice(0, 10)
  const todayNew = vo.filter(o => o.created === today).length
  const pending = vo.filter(o => o.status === '待处理').length
  const done = vo.filter(o => o.status === '已完成' || o.status === '已关闭').length
  return [
    { icon: '📋', iconBg: 'bg-blue-100', label: '今日新增工单', value: todayNew, path: '/orders' },
    { icon: '⏳', iconBg: 'bg-orange-100', label: '待处理工单', value: pending, path: '/orders' },
    { icon: '✅', iconBg: 'bg-green-100', label: '已完成工单', value: done, path: '/orders' },
    { icon: '🖨️', iconBg: 'bg-red-100', label: '故障设备', value: store.faultDevices, path: '/devices' },
  ]
})

const pendingCount = computed(() => store.visibleOrders.filter(o => o.status === '待处理').length)
const doneCount = computed(() => store.visibleOrders.filter(o => o.status === '已完成' || o.status === '已关闭').length)
const total = computed(() => store.visibleOrders.length || 1)
const pendingPct = computed(() => Math.round(pendingCount.value / total.value * 100))
const donePct = computed(() => Math.round(doneCount.value / total.value * 100))

const statusLegend = computed(() => [
  { label: '已完成', count: doneCount.value, pct: donePct.value, color: 'bg-green-500' },
  { label: '待处理', count: pendingCount.value, pct: pendingPct.value, color: 'bg-orange-500' },
  { label: '处理中', count: store.visibleOrders.filter(o => o.status === '处理中').length, pct: 0, color: 'bg-blue-500' },
  { label: '待验收', count: store.visibleOrders.filter(o => o.status === '待验收').length, pct: 0, color: 'bg-yellow-400' },
])

const urgentOrders = computed(() => store.visibleOrders.filter(o => o.priority === '紧急' && o.status !== '已完成' && o.status !== '已关闭').slice(0, 4))
const recentOrders = computed(() => store.visibleOrders.slice(0, 8))
</script>

<style scoped>
@keyframes fade-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
.animate-fade-in { animation: fade-in 0.35s ease; }
</style>
