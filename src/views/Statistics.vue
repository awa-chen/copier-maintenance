<template>
  <div class="space-y-5">
    <!-- 时间筛选 -->
    <div class="flex gap-3 items-center flex-wrap bg-white p-4 rounded-xl shadow-sm">
      <span class="text-sm text-gray-500">统计周期：</span>
      <select v-model="year" class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option v-for="y in years" :key="y" :value="y">{{ y }}年</option>
      </select>
      <div class="flex gap-1 ml-auto">
        <button @click="viewType = 'month'" :class="['px-3 py-1.5 rounded-lg text-sm transition', viewType === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']">月度</button>
        <button @click="viewType = 'year'" :class="['px-3 py-1.5 rounded-lg text-sm transition', viewType === 'year' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']">年度</button>
      </div>
    </div>

    <!-- 核心指标卡片 -->
    <div class="grid grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-5 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm text-gray-500">年度工单总量</span>
          <span class="text-2xl">📋</span>
        </div>
        <div class="text-2xl font-bold text-gray-800">{{ yearlyStats.totalOrders }}</div>
        <div class="text-xs text-gray-400 mt-1">已完成 {{ yearlyStats.completedOrders }} 单</div>
      </div>
      <div class="bg-white rounded-xl p-5 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm text-gray-500">年度收入</span>
          <span class="text-2xl">💰</span>
        </div>
        <div class="text-2xl font-bold text-green-600">¥{{ yearlyStats.totalRevenue.toLocaleString() }}</div>
        <div class="text-xs text-gray-400 mt-1">结算 {{ yearlyStats.settlementCount }} 笔</div>
      </div>
      <div class="bg-white rounded-xl p-5 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm text-gray-500">配件销售</span>
          <span class="text-2xl">🔧</span>
        </div>
        <div class="text-2xl font-bold text-orange-600">¥{{ yearlyStats.partsRevenue.toLocaleString() }}</div>
        <div class="text-xs text-gray-400 mt-1">{{ yearlyStats.partsCount }} 次更换</div>
      </div>
      <div class="bg-white rounded-xl p-5 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm text-gray-500">客户数量</span>
          <span class="text-2xl">🏢</span>
        </div>
        <div class="text-2xl font-bold text-blue-600">{{ store.customers.length }}</div>
        <div class="text-xs text-gray-400 mt-1">设备 {{ store.devices.length }} 台</div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="grid grid-cols-2 gap-4">
      <!-- 工单趋势图 -->
      <div class="bg-white rounded-xl p-5 shadow-sm">
        <h3 class="font-semibold text-gray-700 mb-4">📈 工单趋势</h3>
        <div class="h-48 flex items-end gap-1">
          <div v-for="(item, i) in orderTrend" :key="i" class="flex-1 flex flex-col items-center gap-1">
            <div class="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition cursor-pointer group relative" :style="{ height: item.total > 0 ? (item.total / maxOrderValue * 100) + '%' : '4px' }">
              <div class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                {{ item.total }}
              </div>
            </div>
            <span class="text-[10px] text-gray-400">{{ item.label }}</span>
          </div>
        </div>
        <div class="flex justify-between mt-3 text-xs text-gray-400">
          <span>总量: {{ yearlyStats.totalOrders }}</span>
          <span>完成率: {{ yearlyStats.completionRate }}%</span>
        </div>
      </div>

      <!-- 收入趋势图 -->
      <div class="bg-white rounded-xl p-5 shadow-sm">
        <h3 class="font-semibold text-gray-700 mb-4">💵 收入趋势</h3>
        <div class="h-48 flex items-end gap-1">
          <div v-for="(item, i) in revenueTrend" :key="i" class="flex-1 flex flex-col items-center gap-1">
            <div class="w-full bg-green-500 rounded-t hover:bg-green-600 transition cursor-pointer group relative" :style="{ height: item.value > 0 ? (item.value / maxRevenueValue * 100) + '%' : '4px' }">
              <div class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                ¥{{ item.value.toLocaleString() }}
              </div>
            </div>
            <span class="text-[10px] text-gray-400">{{ item.label }}</span>
          </div>
        </div>
        <div class="flex justify-between mt-3 text-xs text-gray-400">
          <span>结算收入: ¥{{ yearlyStats.totalRevenue.toLocaleString() }}</span>
          <span>配件收入: ¥{{ yearlyStats.partsRevenue.toLocaleString() }}</span>
        </div>
      </div>
    </div>

    <!-- 工单状态分布 & 设备故障率 -->
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-white rounded-xl p-5 shadow-sm">
        <h3 class="font-semibold text-gray-700 mb-4">🥧 工单状态分布</h3>
        <div class="flex items-center gap-6">
          <div class="relative w-32 h-32 flex-shrink-0">
            <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" stroke-width="12"/>
              <circle v-for="(item, i) in statusPie" :key="item.name" cx="50" cy="50" r="40" fill="none" 
                :stroke="statusColors[i]" stroke-width="12"
                :stroke-dasharray="`${item.pct * 2.51} 251`"
                :stroke-dashoffset="`-${statusPie.slice(0, i).reduce((s, x) => s + x.pct * 2.51, 0)}`"
                stroke-linecap="round"/>
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-lg font-bold">{{ yearlyStats.totalOrders }}</span>
              <span class="text-[10px] text-gray-400">总工单</span>
            </div>
          </div>
          <div class="flex-1 space-y-2">
            <div v-for="(item, i) in statusPie" :key="item.name" class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-sm flex-shrink-0" :style="{ background: statusColors[i] }"></div>
              <span class="text-sm text-gray-600 flex-1">{{ item.name }}</span>
              <span class="text-sm font-medium">{{ item.count }}</span>
              <span class="text-xs text-gray-400 w-10 text-right">{{ item.pct }}%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-5 shadow-sm">
        <h3 class="font-semibold text-gray-700 mb-4">🔧 设备故障TOP10</h3>
        <div class="space-y-2 max-h-56 overflow-y-auto">
          <div v-for="(d, i) in deviceFaultRank" :key="d.id" class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition">
            <span class="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
              :class="i < 3 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'">{{ i + 1 }}</span>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-700 truncate">{{ d.model }}</div>
              <div class="text-xs text-gray-400">{{ d.customer }}</div>
            </div>
            <div class="text-right">
              <div class="text-sm font-bold" :class="d.faultCount > 3 ? 'text-red-600' : 'text-gray-700'">{{ d.faultCount }}</div>
              <div class="text-xs text-gray-400">次故障</div>
            </div>
            <div :class="['w-16 h-2 rounded-full overflow-hidden', d.faultCount > 3 ? 'bg-red-100' : 'bg-gray-100']">
              <div :class="['h-full rounded-full', d.faultCount > 3 ? 'bg-red-500' : 'bg-blue-500']" 
                :style="{ width: (d.faultCount / maxFaultCount * 100) + '%' }"></div>
            </div>
          </div>
          <div v-if="deviceFaultRank.length === 0" class="text-center py-8 text-gray-400 text-sm">暂无故障数据</div>
        </div>
      </div>
    </div>

    <!-- 技术员工作量 & 客户排行 -->
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-white rounded-xl p-5 shadow-sm">
        <h3 class="font-semibold text-gray-700 mb-4">👷 技术员工作量</h3>
        <div class="space-y-3">
          <div v-for="t in techWorkloadData" :key="t.name" class="flex items-center gap-3">
            <div class="w-20 text-sm font-medium text-gray-700 truncate">{{ t.name }}</div>
            <div class="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full bg-blue-500 rounded-full" :style="{ width: (t.total / maxTechWorkload * 100) + '%' }"></div>
            </div>
            <div class="w-16 text-right text-sm">
              <span class="text-gray-700 font-medium">{{ t.total }}</span>
              <span class="text-gray-400 text-xs"> 单</span>
            </div>
            <div class="w-12 text-right text-xs text-green-600">{{ t.completed }} ✓</div>
          </div>
          <div v-if="techWorkloadData.length === 0" class="text-center py-8 text-gray-400 text-sm">暂无数据</div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-5 shadow-sm">
        <h3 class="font-semibold text-gray-700 mb-4">🏆 客户业务排行</h3>
        <div class="space-y-3">
          <div v-for="(c, i) in customerRank" :key="c.id" class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition">
            <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              :class="i < 3 ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-500'">{{ i + 1 }}</span>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-700 truncate">{{ c.name }}</div>
              <div class="text-xs text-gray-400">{{ c.deviceCount }} 台设备</div>
            </div>
            <div class="text-right">
              <div class="text-sm font-bold text-blue-600">{{ c.orderCount }}</div>
              <div class="text-xs text-gray-400">工单</div>
            </div>
          </div>
          <div v-if="customerRank.length === 0" class="text-center py-8 text-gray-400 text-sm">暂无数据</div>
        </div>
      </div>
    </div>

    <!-- 配件消耗排行 -->
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-white rounded-xl p-5 shadow-sm">
        <h3 class="font-semibold text-gray-700 mb-4">🔩 配件消耗排行</h3>
        <div class="space-y-3">
          <div v-for="(p, i) in partsConsumeRank" :key="p.id" class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition">
            <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              :class="i === 0 ? 'bg-yellow-100 text-yellow-600' : i === 1 ? 'bg-gray-100 text-gray-500' : i === 2 ? 'bg-orange-100 text-orange-500' : 'bg-gray-50 text-gray-400'">{{ i + 1 }}</span>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-700 truncate">{{ p.name }}</div>
              <div class="text-xs text-gray-400">{{ p.model }}</div>
            </div>
            <div class="text-right mr-2">
              <div class="text-sm font-bold text-orange-600">{{ p.totalQty }}</div>
              <div class="text-xs text-gray-400">{{ p.unit }}</div>
            </div>
            <div class="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full bg-orange-400 rounded-full" :style="{ width: (p.totalQty / maxPartConsume * 100) + '%' }"></div>
            </div>
          </div>
          <div v-if="partsConsumeRank.length === 0" class="text-center py-8 text-gray-400 text-sm">暂无配件消耗数据</div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-5 shadow-sm">
        <h3 class="font-semibold text-gray-700 mb-4">💵 配件消耗金额排行</h3>
        <div class="space-y-3">
          <div v-for="(p, i) in partsAmountRank" :key="p.id" class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition">
            <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              :class="i === 0 ? 'bg-yellow-100 text-yellow-600' : i === 1 ? 'bg-gray-100 text-gray-500' : i === 2 ? 'bg-orange-100 text-orange-500' : 'bg-gray-50 text-gray-400'">{{ i + 1 }}</span>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-700 truncate">{{ p.name }}</div>
              <div class="text-xs text-gray-400">{{ p.totalQty }} {{ p.unit }}</div>
            </div>
            <div class="text-right">
              <div class="text-sm font-bold text-green-600">¥{{ p.totalAmount.toLocaleString() }}</div>
              <div class="text-xs text-gray-400">消耗金额</div>
            </div>
          </div>
          <div v-if="partsAmountRank.length === 0" class="text-center py-8 text-gray-400 text-sm">暂无配件消耗数据</div>
        </div>
      </div>
    </div>

    <!-- 详细数据表格 -->
    <div class="bg-white rounded-xl shadow-sm">
      <div class="p-5 border-b">
        <h3 class="font-semibold text-gray-700">📊 详细数据报表</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-xs text-gray-400 uppercase border-b bg-gray-50/50">
              <th class="px-5 py-3 font-medium">月份</th>
              <th class="px-5 py-3 font-medium">工单总量</th>
              <th class="px-5 py-3 font-medium">已完成</th>
              <th class="px-5 py-3 font-medium">完成率</th>
              <th class="px-5 py-3 font-medium">结算收入</th>
              <th class="px-5 py-3 font-medium">配件收入</th>
              <th class="px-5 py-3 font-medium">总收入</th>
            </tr>
          </thead>
          <tbody class="text-gray-700">
            <tr v-for="row in monthlyData" :key="row.month" class="border-b border-gray-50 hover:bg-gray-50">
              <td class="px-5 py-3 font-medium">{{ row.month }}</td>
              <td class="px-5 py-3">{{ row.totalOrders }}</td>
              <td class="px-5 py-3">{{ row.completedOrders }}</td>
              <td class="px-5 py-3">
                <span :class="row.completionRate >= 80 ? 'text-green-600' : row.completionRate >= 50 ? 'text-orange-600' : 'text-red-600'">
                  {{ row.completionRate }}%
                </span>
              </td>
              <td class="px-5 py-3 text-green-600">¥{{ row.settlementRevenue.toLocaleString() }}</td>
              <td class="px-5 py-3 text-orange-600">¥{{ row.partsRevenue.toLocaleString() }}</td>
              <td class="px-5 py-3 font-medium">¥{{ row.totalRevenue.toLocaleString() }}</td>
            </tr>
            <tr class="bg-gray-50 font-medium">
              <td class="px-5 py-3">合计</td>
              <td class="px-5 py-3">{{ yearlyStats.totalOrders }}</td>
              <td class="px-5 py-3">{{ yearlyStats.completedOrders }}</td>
              <td class="px-5 py-3">{{ yearlyStats.completionRate }}%</td>
              <td class="px-5 py-3 text-green-600">¥{{ yearlyStats.totalRevenue.toLocaleString() }}</td>
              <td class="px-5 py-3 text-orange-600">¥{{ yearlyStats.partsRevenue.toLocaleString() }}</td>
              <td class="px-5 py-3">¥{{ (yearlyStats.totalRevenue + yearlyStats.partsRevenue).toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../stores/app'

const store = useAppStore()

const year = ref(new Date().getFullYear())
const years = [2024, 2025, 2026]
const viewType = ref('month')

const statusColors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#9ca3af']

// 年度统计数据
const yearlyStats = computed(() => {
  const y = year.value
  
  // 工单统计
  const yearOrders = store.orders.filter(o => new Date(o.created).getFullYear() === y)
  const totalOrders = yearOrders.length
  const completedOrders = yearOrders.filter(o => o.status === '已完成' || o.status === '已关闭').length
  const completionRate = totalOrders > 0 ? Math.round(completedOrders / totalOrders * 100) : 0
  
  // 结算收入
  const yearSettlements = store.settlements.filter(s => {
    const sYear = parseInt(s.period.split('-')[0])
    return sYear === y && s.status === '已结算'
  })
  const totalRevenue = yearSettlements.reduce((sum, s) => sum + s.amount, 0)
  const settlementCount = yearSettlements.length
  
  // 配件收入
  const yearParts = store.partUsages.filter(p => new Date(p.date).getFullYear() === y)
  const partsRevenue = yearParts.reduce((sum, p) => sum + p.price, 0)
  const partsCount = yearParts.length
  
  return { totalOrders, completedOrders, completionRate, totalRevenue, settlementCount, partsRevenue, partsCount }
})

// 工单趋势
const orderTrend = computed(() => {
  const y = year.value
  if (viewType.value === 'month') {
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1
      const orders = store.orders.filter(o => {
        const d = new Date(o.created)
        return d.getFullYear() === y && d.getMonth() === i
      })
      return {
        label: `${month}月`,
        total: orders.length,
        completed: orders.filter(o => o.status === '已完成' || o.status === '已关闭').length
      }
    })
  } else {
    return years.map(y => {
      const orders = store.orders.filter(o => new Date(o.created).getFullYear() === y)
      return {
        label: `${y}`,
        total: orders.length,
        completed: orders.filter(o => o.status === '已完成' || o.status === '已关闭').length
      }
    })
  }
})

const maxOrderValue = computed(() => Math.max(...orderTrend.value.map(o => o.total), 1))

// 收入趋势
const revenueTrend = computed(() => {
  const y = year.value
  if (viewType.value === 'month') {
    return Array.from({ length: 12 }, (_, i) => {
      const monthStr = `${y}-${String(i + 1).padStart(2, '0')}`
      const settlement = store.settlements.filter(s => s.period === monthStr && s.status === '已结算').reduce((sum, s) => sum + s.amount, 0)
      const parts = store.partUsages.filter(p => {
        const d = new Date(p.date)
        return d.getFullYear() === y && d.getMonth() === i
      }).reduce((sum, p) => sum + p.price, 0)
      return {
        label: `${i + 1}月`,
        value: settlement + parts
      }
    })
  } else {
    return years.map(y => {
      const settlement = store.settlements.filter(s => {
        const sYear = parseInt(s.period.split('-')[0])
        return sYear === y && s.status === '已结算'
      }).reduce((sum, s) => sum + s.amount, 0)
      const parts = store.partUsages.filter(p => new Date(p.date).getFullYear() === y).reduce((sum, p) => sum + p.price, 0)
      return {
        label: `${y}`,
        value: settlement + parts
      }
    })
  }
})

const maxRevenueValue = computed(() => Math.max(...revenueTrend.value.map(r => r.value), 1))

// 工单状态饼图
const statusPie = computed(() => {
  const y = year.value
  const yearOrders = store.orders.filter(o => new Date(o.created).getFullYear() === y)
  const statusCounts = { '已完成': 0, '处理中': 0, '待验收': 0, '待处理': 0, '已关闭': 0 }
  yearOrders.forEach(o => {
    if (statusCounts[o.status] !== undefined) statusCounts[o.status]++
  })
  const total = yearOrders.length || 1
  return Object.entries(statusCounts)
    .filter(([_, v]) => v > 0)
    .map(([name, count]) => ({
      name,
      count,
      pct: Math.round(count / total * 100)
    }))
})

// 设备故障排行
const deviceFaultRank = computed(() => {
  const y = year.value
  return store.devices.map(d => {
    const faultCount = store.orders.filter(o => {
      return o.device === d.id && new Date(o.created).getFullYear() === y && 
        (o.priority === '紧急' || o.priority === '高' || o.status === '故障')
    }).length
    return {
      id: d.id,
      model: d.model,
      sn: d.sn,
      customer: store.getCustomerName(d.customer),
      faultCount
    }
  }).sort((a, b) => b.faultCount - a.faultCount).slice(0, 10)
})

const maxFaultCount = computed(() => Math.max(...deviceFaultRank.value.map(d => d.faultCount), 1))

// 技术员工作量
const techWorkloadData = computed(() => {
  const y = year.value
  return store.techs.map(name => {
    const total = store.orders.filter(o => o.assignee === name && new Date(o.created).getFullYear() === y).length
    const completed = store.orders.filter(o => o.assignee === name && new Date(o.created).getFullYear() === y && (o.status === '已完成' || o.status === '已关闭')).length
    return { name, total, completed }
  }).filter(t => t.total > 0).sort((a, b) => b.total - a.total)
})

const maxTechWorkload = computed(() => Math.max(...techWorkloadData.value.map(t => t.total), 1))

// 配件消耗排行（按数量）
const partsConsumeRank = computed(() => {
  const y = year.value
  return store.parts.map(p => {
    const totalQty = store.partUsages.filter(u => {
      const d = new Date(u.date)
      return u.part === p.id && d.getFullYear() === y
    }).reduce((sum, u) => sum + u.qty, 0)
    return { id: p.id, name: p.name, model: p.model, unit: p.unit, totalQty }
  }).filter(p => p.totalQty > 0).sort((a, b) => b.totalQty - a.totalQty).slice(0, 10)
})

const maxPartConsume = computed(() => Math.max(...partsConsumeRank.value.map(p => p.totalQty), 1))

// 配件消耗排行（按金额）
const partsAmountRank = computed(() => {
  const y = year.value
  return store.parts.map(p => {
    const totalAmount = store.partUsages.filter(u => {
      const d = new Date(u.date)
      return u.part === p.id && d.getFullYear() === y
    }).reduce((sum, u) => sum + u.price, 0)
    const totalQty = store.partUsages.filter(u => {
      const d = new Date(u.date)
      return u.part === p.id && d.getFullYear() === y
    }).reduce((sum, u) => sum + u.qty, 0)
    return { id: p.id, name: p.name, unit: p.unit, totalQty, totalAmount }
  }).filter(p => p.totalAmount > 0).sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 10)
})

// 客户排行
const customerRank = computed(() => {
  return store.customers.map(c => {
    const orderCount = store.orders.filter(o => o.customer === c.id).length
    const deviceCount = store.devices.filter(d => d.customer === c.id).length
    return { id: c.id, name: c.name, orderCount, deviceCount }
  }).sort((a, b) => b.orderCount - a.orderCount).slice(0, 10)
})

// 月度详细数据
const monthlyData = computed(() => {
  const y = year.value
  return Array.from({ length: 12 }, (_, i) => {
    const month = `${y}-${String(i + 1).padStart(2, '0')}`
    const monthOrders = store.orders.filter(o => {
      const d = new Date(o.created)
      return d.getFullYear() === y && d.getMonth() === i
    })
    const totalOrders = monthOrders.length
    const completedOrders = monthOrders.filter(o => o.status === '已完成' || o.status === '已关闭').length
    const completionRate = totalOrders > 0 ? Math.round(completedOrders / totalOrders * 100) : 0
    
    const settlementRevenue = store.settlements.filter(s => s.period === month && s.status === '已结算').reduce((sum, s) => sum + s.amount, 0)
    const partsRevenue = store.partUsages.filter(p => {
      const d = new Date(p.date)
      return d.getFullYear() === y && d.getMonth() === i
    }).reduce((sum, p) => sum + p.price, 0)
    
    return {
      month: `${i + 1}月`,
      totalOrders,
      completedOrders,
      completionRate,
      settlementRevenue,
      partsRevenue,
      totalRevenue: settlementRevenue + partsRevenue
    }
  })
})
</script>
