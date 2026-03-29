<template>
  <div class="space-y-4">
    <!-- 合同状态统计卡片 -->
    <div class="grid grid-cols-4 gap-4">
      <div v-for="s in contractStats" :key="s.label"
        class="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer"
        @click="fStatus = s.filterKey">
        <div :class="['w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0', s.iconBg]">{{ s.icon }}</div>
        <div>
          <div class="text-xl font-bold text-gray-800" style="font-family: monospace">{{ s.value }}</div>
          <div class="text-xs text-gray-400">{{ s.label }}</div>
        </div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="flex gap-3 items-center flex-wrap">
      <input v-model="kw" type="text" placeholder="搜索合同名称/客户..." class="px-4 py-2 border border-gray-200 rounded-lg text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-500">
      <select v-model="fStatus" class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">全部状态</option>
        <option>生效中</option>
        <option>即将到期</option>
        <option>已完成</option>
        <option>已终止</option>
      </select>
      <select v-model="fType" class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">全部类型</option>
        <option v-for="t in store.contractTypes" :key="t">{{ t }}</option>
      </select>
      <div class="ml-auto">
        <button @click="showForm(null)" class="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">+ 新建合同</button>
      </div>
    </div>

    <!-- 合同到期提醒：仅状态为「即将到期」时显示 -->
    <div v-if="expiringContracts.length > 0" class="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-2">
      <span class="text-orange-500 mt-0.5">⚠️</span>
      <div class="flex-1">
        <span class="text-sm text-orange-700 font-medium">{{ expiringContracts.length }} 份合同即将到期，请及时续签或终止</span>
        <div class="mt-1 space-y-0.5">
          <div v-for="c in expiringContracts" :key="c.id" class="text-xs text-orange-600">
            · {{ c.title }}（到期：{{ c.endDate }}）
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-xs text-gray-400 uppercase border-b bg-gray-50/50">
            <th class="px-4 py-3 font-medium">合同编号</th>
            <th class="px-4 py-3 font-medium">合同名称</th>
            <th class="px-4 py-3 font-medium">客户</th>
            <th class="px-4 py-3 font-medium">类型</th>
            <th class="px-4 py-3 font-medium">服务期限</th>
            <th class="px-4 py-3 font-medium">合同金额</th>
            <th class="px-4 py-3 font-medium">状态</th>
            <th class="px-4 py-3 font-medium">操作</th>
          </tr>
        </thead>
        <tbody class="text-gray-700">
          <tr v-for="c in filtered" :key="c.id" class="border-b border-gray-50 hover:bg-blue-50/30 transition cursor-pointer"
            @click="showDetail(c)">
            <td class="px-4 py-3 font-mono text-xs text-blue-600">{{ c.id }}</td>
            <td class="px-4 py-3">
              <div class="font-medium">{{ c.title }}</div>
              <div v-if="c.note" class="text-xs text-gray-400">{{ c.note }}</div>
            </td>
            <td class="px-4 py-3">{{ store.getCustomerName(c.customer) }}</td>
            <td class="px-4 py-3">
              <span class="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{{ c.type }}</span>
            </td>
            <td class="px-4 py-3 text-xs">
              <div>{{ c.startDate }}</div>
              <div class="text-gray-400">至 {{ c.endDate }}</div>
            </td>
            <td class="px-4 py-3 font-medium text-green-600">¥{{ c.amount.toLocaleString() }}</td>
            <td class="px-4 py-3">
              <span :class="['inline-block px-2 py-0.5 rounded-full text-xs font-medium', contractStatusClass(c.status)]">
                {{ c.status }}
              </span>
            </td>
            <td class="px-4 py-3" @click.stop>
              <button @click="showForm(c)" class="text-blue-500 hover:text-blue-700 text-xs mr-1">编辑</button>
              <button @click="confirmDel(c)" class="text-red-400 hover:text-red-600 text-xs">删除</button>
            </td>
          </tr>
          <tr v-if="filtered.length === 0">
            <td colspan="8" class="text-center py-12 text-gray-400">
              <div class="text-4xl mb-2">📄</div>暂无合同数据
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Detail Modal -->
    <div v-if="detail" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" @click.self="detail=null">
      <div class="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="flex items-center justify-between p-5 border-b">
          <h2 class="font-semibold text-gray-800">合同详情 — <span class="text-blue-600 font-mono text-sm">{{ detail.id }}</span></h2>
          <button @click="detail=null" class="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div class="p-5">
          <div class="grid grid-cols-2 gap-3 mb-5">
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">合同名称</div><div class="text-sm font-medium">{{ detail.title }}</div></div>
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">状态</div><span :class="['inline-block px-2 py-0.5 rounded-full text-xs font-medium', contractStatusClass(detail.status)]">{{ detail.status }}</span></div>
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">客户</div><div class="text-sm">{{ store.getCustomerName(detail.customer) }}</div></div>
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">合同类型</div><div class="text-sm">{{ detail.type }}</div></div>
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">服务期限</div><div class="text-sm">{{ detail.startDate }} ~ {{ detail.endDate }}</div></div>
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">合同金额</div><div class="text-sm text-green-600 font-bold">¥{{ detail.amount.toLocaleString() }}</div></div>
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">付款周期</div><div class="text-sm">{{ detail.payCycle }}</div></div>
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">关联设备</div><div class="text-sm">{{ detail.devices?.length || 0 }} 台</div></div>
            <div class="bg-gray-50 rounded-lg p-3 col-span-2"><div class="text-xs text-gray-400 mb-1">备注</div><div class="text-sm">{{ detail.note || '-' }}</div></div>
          </div>

          <!-- 关联设备列表 -->
          <div class="mb-5">
            <div class="text-xs font-medium text-gray-500 mb-2">关联设备</div>
            <div v-if="contractDevices.length > 0" class="space-y-2">
              <div v-for="d in contractDevices" :key="d.id" class="flex items-center justify-between bg-gray-50 rounded-lg p-2 text-xs">
                <div>
                  <span class="font-medium">{{ d.model }}</span>
                  <span class="text-gray-400 ml-2">{{ d.sn }}</span>
                </div>
                <span :class="['px-2 py-0.5 rounded-full', store.badgeClass(d.status)]">{{ d.status }}</span>
              </div>
            </div>
            <div v-else class="text-xs text-gray-400 bg-gray-50 rounded-lg p-3 text-center">暂无关联设备</div>
          </div>

          <div class="flex gap-3 mt-5">
            <button @click="showForm(detail); detail=null" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">编辑</button>
            <button @click="confirmDel(detail); detail=null" class="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600">删除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Modal -->
    <div v-if="form" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" @click.self="form=null">
      <div class="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="flex items-center justify-between p-5 border-b">
          <h2 class="font-semibold text-gray-800">{{ isEdit ? '编辑' : '新建' }}合同</h2>
          <button @click="form=null" class="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div class="p-5 space-y-4">
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">合同名称 *</label>
            <input v-model="form.title" type="text" placeholder="请输入合同名称" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">客户 *</label>
              <select v-model="form.customer" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">选择客户</option>
                <option v-for="c in store.customers" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">合同类型 *</label>
              <select v-model="form.type" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option v-for="t in store.contractTypes" :key="t">{{ t }}</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">开始日期 *</label>
              <input v-model="form.startDate" type="date" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">结束日期 *</label>
              <input v-model="form.endDate" type="date" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">合同金额 (元) *</label>
              <input v-model.number="form.amount" type="number" min="0" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">付款周期</label>
              <select v-model="form.payCycle" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>单次</option>
                <option>月结</option>
                <option>月付</option>
                <option>季付</option>
                <option>半年付</option>
                <option>年付</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">关联设备</label>
            <div v-if="form.customer" class="border border-gray-200 rounded-lg max-h-32 overflow-y-auto p-2 space-y-1">
              <label v-for="d in customerDevices" :key="d.id" class="flex items-center gap-2 text-sm p-1 hover:bg-gray-50 rounded cursor-pointer">
                <input type="checkbox" :value="d.id" v-model="form.devices" class="rounded text-blue-600">
                <span>{{ d.model }}</span>
                <span class="text-xs text-gray-400">({{ d.sn }})</span>
              </label>
              <div v-if="customerDevices.length === 0" class="text-xs text-gray-400 text-center py-2">该客户暂无设备</div>
            </div>
            <div v-else class="text-xs text-gray-400 bg-gray-50 rounded-lg p-3 text-center">请先选择客户</div>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">状态</label>
            <select v-model="form.status" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="生效中">生效中（系统自动：到期前30天内→即将到期，过期→已终止）</option>
              <option value="即将到期">即将到期（需手动设置）</option>
              <option>已完成</option>
              <option>已终止</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">备注</label>
            <textarea v-model="form.note" rows="2" placeholder="可选备注信息" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
          </div>
          <div class="flex gap-3 pt-2">
            <button @click="form=null" class="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">取消</button>
            <button @click="saveForm" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">保存</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Delete -->
    <div v-if="delTarget" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" @click.self="delTarget=null">
      <div class="bg-white rounded-xl p-6 max-w-sm w-full text-center shadow-2xl">
        <div class="text-4xl mb-3">🗑️</div>
        <p class="text-gray-700 mb-5">确定删除合同 <b>{{ delTarget.id }}</b> 吗？此操作不可恢复。</p>
        <div class="flex gap-3">
          <button @click="delTarget=null" class="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">取消</button>
          <button @click="doDelete" class="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600">确认删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue'
import { useAppStore } from '../stores/app'

const store = useAppStore()
const showToast = inject('showToast')

const kw = ref('')
const fStatus = ref('')
const fType = ref('')
const form = ref(null)
const isEdit = ref(false)
const delTarget = ref(null)
const detail = ref(null)

// 页面加载时自动检查合同状态
onMounted(() => {
  autoCheckContracts()
})

// 系统自动判断合同状态（基于到期日期）
function autoCheckContracts() {
  const today = new Date()
  const thirtyDaysLater = new Date()
  thirtyDaysLater.setDate(today.getDate() + 30)

  let updatedCount = 0

  store.contracts.forEach(c => {
    if (c.status !== '生效中' && c.status !== '即将到期') return
    const endDate = new Date(c.endDate)
    if (endDate < today) {
      if (c.status !== '已终止') {
        store.updateContract(c.id, { status: '已终止' })
        updatedCount++
      }
    } else if (endDate <= thirtyDaysLater) {
      if (c.status === '生效中') {
        store.updateContract(c.id, { status: '即将到期' })
        updatedCount++
      }
    }
  })

  if (updatedCount > 0) {
    showToast(`系统已自动更新 ${updatedCount} 份合同状态`)
  }
}

// 合同状态统计
const contractStats = computed(() => {
  const total = store.contracts.length
  const active = store.contracts.filter(c => c.status === '生效中').length
  const expiring = store.contracts.filter(c => c.status === '即将到期').length
  const completed = store.contracts.filter(c => c.status === '已完成').length
  return [
    { icon: '📄', iconBg: 'bg-blue-100', label: '全部合同', value: total, filterKey: '' },
    { icon: '✅', iconBg: 'bg-green-100', label: '生效中', value: active, filterKey: '生效中' },
    { icon: '⏰', iconBg: 'bg-orange-100', label: '即将到期', value: expiring, filterKey: '即将到期' },
    { icon: '🏁', iconBg: 'bg-gray-100', label: '已完成/已终止', value: completed + store.contracts.filter(c => c.status === '已终止').length, filterKey: '' },
  ]
})

const filtered = computed(() => {
  return store.contracts.filter(c => {
    const matchKw = !kw.value || c.title.includes(kw.value) || store.getCustomerName(c.customer).includes(kw.value)
    const matchStatus = !fStatus.value || c.status === fStatus.value
    const matchType = !fType.value || c.type === fType.value
    return matchKw && matchStatus && matchType
  })
})

// 仅显示已手动标记为「即将到期」状态的合同
const expiringContracts = computed(() => {
  return store.contracts.filter(c => c.status === '即将到期')
})

const customerDevices = computed(() => {
  if (!form.value?.customer) return []
  return store.devices.filter(d => d.customer === form.value.customer)
})

const contractDevices = computed(() => {
  if (!detail.value?.devices) return []
  return detail.value.devices.map(id => store.devices.find(d => d.id === id)).filter(Boolean)
})

function contractStatusClass(status) {
  const map = {
    '生效中': 'bg-green-100 text-green-700',
    '即将到期': 'bg-orange-100 text-orange-700',
    '已完成': 'bg-gray-100 text-gray-600',
    '已终止': 'bg-red-100 text-red-600'
  }
  return map[status] || 'bg-gray-100 text-gray-600'
}

function showDetail(c) { detail.value = c }

function showForm(c) {
  if (c) {
    isEdit.value = true
    form.value = { ...c, devices: [...(c.devices || [])] }
  } else {
    isEdit.value = false
    form.value = { title: '', customer: '', type: '全包服务', startDate: '', endDate: '', amount: 0, payCycle: '月付', status: '生效中', devices: [], note: '' }
  }
}

function saveForm() {
  if (!form.value.title || !form.value.customer || !form.value.startDate || !form.value.endDate || !form.value.amount) {
    showToast('请填写必填项', 'error'); return
  }
  if (isEdit.value) {
    store.updateContract(form.value.id, form.value)
    showToast('合同已更新')
  } else {
    store.addContract(form.value)
    showToast('合同已创建')
  }
  form.value = null
}

function confirmDel(c) { delTarget.value = c }
function doDelete() {
  store.deleteContract(delTarget.value.id)
  showToast('合同已删除')
  delTarget.value = null
}
</script>
