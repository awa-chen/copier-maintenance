<template>
  <div class="space-y-4">
    <div class="flex gap-3 items-center flex-wrap">
      <input v-model="kw" type="text" placeholder="搜索客户/合同..." class="px-4 py-2 border border-gray-200 rounded-lg text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-500">
      <select v-model="fStatus" class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">全部状态</option>
        <option>待收款</option>
        <option>待确认</option>
        <option>已结算</option>
      </select>
      <select v-model="fType" class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">全部类型</option>
        <option>合同结算</option>
        <option>租赁结算</option>
        <option>计次结算</option>
        <option>单次结算</option>
      </select>
      <div class="ml-auto">
        <button @click="showSettleForm" class="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">+ 新建结算</button>
      </div>
    </div>

    <!-- 待处理结算提醒 -->
    <div v-if="pendingSettlements.length > 0" class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
      <span class="text-yellow-500">⏳</span>
      <span class="text-sm text-yellow-700">{{ pendingSettlements.length }} 笔结算待处理，请及时确认</span>
    </div>

    <!-- 月度收入统计 -->
    <div class="grid grid-cols-4 gap-4">
      <div v-for="s in monthStats" :key="s.label" class="bg-white rounded-xl p-4 shadow-sm">
        <div class="text-xs text-gray-400 mb-1">{{ s.label }}</div>
        <div class="text-xl font-bold text-gray-800">¥{{ s.value.toLocaleString() }}</div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-xs text-gray-400 uppercase border-b bg-gray-50/50">
            <th class="px-4 py-3 font-medium">结算编号</th>
            <th class="px-4 py-3 font-medium">客户</th>
            <th class="px-4 py-3 font-medium">合同</th>
            <th class="px-4 py-3 font-medium">结算周期</th>
            <th class="px-4 py-3 font-medium">类型</th>
            <th class="px-4 py-3 font-medium">结算金额</th>
            <th class="px-4 py-3 font-medium">状态</th>
            <th class="px-4 py-3 font-medium">操作</th>
          </tr>
        </thead>
        <tbody class="text-gray-700">
          <tr v-for="s in filtered" :key="s.id" class="border-b border-gray-50 hover:bg-blue-50/30 transition cursor-pointer"
            @click="showDetail(s)">
            <td class="px-4 py-3 font-mono text-xs text-blue-600">{{ s.id }}</td>
            <td class="px-4 py-3">{{ store.getCustomerName(s.customer) }}</td>
            <td class="px-4 py-3 text-xs">{{ getContractTitle(s.contract) }}</td>
            <td class="px-4 py-3 text-xs">{{ s.period }}</td>
            <td class="px-4 py-3">
              <span class="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{{ s.type }}</span>
            </td>
            <td class="px-4 py-3 font-medium text-green-600">¥{{ s.amount.toLocaleString() }}</td>
            <td class="px-4 py-3">
              <span :class="['inline-block px-2 py-0.5 rounded-full text-xs font-medium', settlementStatusClass(s.status)]">
                {{ s.status }}
              </span>
            </td>
            <td class="px-4 py-3" @click.stop>
              <button v-if="s.status !== '已结算'" @click="showSettleForm(s)" class="text-blue-500 hover:text-blue-700 text-xs mr-1">编辑</button>
              <button v-if="s.status === '待收款'" @click="confirmPay(s)" class="text-green-500 hover:text-green-700 text-xs mr-1">确认收款</button>
              <button v-if="s.status === '待确认'" @click="confirmSettlement(s)" class="text-blue-500 hover:text-blue-700 text-xs">确认结算</button>
              <button @click="confirmDel(s)" class="text-red-400 hover:text-red-600 text-xs ml-1">删除</button>
            </td>
          </tr>
          <tr v-if="filtered.length === 0">
            <td colspan="8" class="text-center py-12 text-gray-400">
              <div class="text-4xl mb-2">💰</div>暂无结算数据
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Detail Modal -->
    <div v-if="detail" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" @click.self="detail=null">
      <div class="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="flex items-center justify-between p-5 border-b">
          <h2 class="font-semibold text-gray-800">结算详情 — <span class="text-blue-600 font-mono text-sm">{{ detail.id }}</span></h2>
          <button @click="detail=null" class="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div class="p-5">
          <div class="grid grid-cols-2 gap-3 mb-5">
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">客户</div><div class="text-sm font-medium">{{ store.getCustomerName(detail.customer) }}</div></div>
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">合同</div><div class="text-sm">{{ getContractTitle(detail.contract) }}</div></div>
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">结算周期</div><div class="text-sm">{{ detail.period }}</div></div>
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">结算类型</div><div class="text-sm">{{ detail.type }}</div></div>
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">结算金额</div><div class="text-sm text-green-600 font-bold">¥{{ detail.amount.toLocaleString() }}</div></div>
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">状态</div><span :class="['inline-block px-2 py-0.5 rounded-full text-xs font-medium', settlementStatusClass(detail.status)]">{{ detail.status }}</span></div>
            <div class="bg-gray-50 rounded-lg p-3" v-if="detail.payDate"><div class="text-xs text-gray-400 mb-1">付款日期</div><div class="text-sm">{{ detail.payDate }}</div></div>
            <div class="bg-gray-50 rounded-lg p-3 col-span-2"><div class="text-xs text-gray-400 mb-1">备注</div><div class="text-sm">{{ detail.note || '-' }}</div></div>
          </div>

          <!-- 抄表记录 -->
          <div v-if="detail.meterReadings">
            <div class="text-xs font-medium text-gray-500 mb-2">📊 抄表记录</div>
            <div class="grid grid-cols-2 gap-3">
              <div v-for="(reading, deviceId) in detail.meterReadings" :key="deviceId" class="bg-gray-50 rounded-lg p-3">
                <div class="text-xs font-medium text-gray-500 mb-2">{{ getDeviceName(deviceId) }}</div>
                <div class="grid grid-cols-2 gap-2 text-sm">
                  <div>黑白: <span class="font-medium">{{ reading.b_w || 0 }}</span> 张</div>
                  <div>彩色: <span class="font-medium">{{ reading.color || 0 }}</span> 张</div>
                  <div class="col-span-2 text-gray-400 text-xs">合计: {{ (reading.b_w || 0) + (reading.color || 0) }} 张</div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-3 mt-5">
            <button v-if="detail.status !== '已结算'" @click="showSettleForm(detail); detail=null" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">编辑</button>
            <button v-if="detail.status === '待收款'" @click="confirmPay(detail); detail=null" class="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">确认收款</button>
            <button v-if="detail.status === '待确认'" @click="confirmSettlement(detail); detail=null" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">确认结算</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Settle Form Modal (含抄表) -->
    <div v-if="settleForm" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" @click.self="settleForm=null">
      <div class="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="flex items-center justify-between p-5 border-b">
          <h2 class="font-semibold text-gray-800">{{ isEdit ? '编辑' : '新建' }}结算</h2>
          <button @click="settleForm=null" class="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div class="p-5 space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">客户 *</label>
              <select v-model="settleForm.customer" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">选择客户</option>
                <option v-for="c in store.customers" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">合同 *</label>
              <select v-model="settleForm.contract" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">选择合同</option>
                <option v-for="c in customerContracts" :key="c.id" :value="c.id">{{ c.title }}</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">结算周期 *</label>
              <input v-model="settleForm.period" type="month" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">结算类型 *</label>
              <select v-model="settleForm.type" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>合同结算</option>
                <option>租赁结算</option>
                <option>计次结算</option>
                <option>单次结算</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">结算金额 (元) *</label>
              <input v-model.number="settleForm.amount" type="number" min="0" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">状态</label>
            <select v-model="settleForm.status" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>待收款</option>
              <option>待确认</option>
              <option>已结算</option>
            </select>
          </div>

          <!-- 抄表录入 -->
          <div v-if="settleForm.contract">
            <label class="block text-xs font-medium text-gray-500 mb-2">📊 抄表记录 (仅计次结算需要)</label>
            <div class="border border-gray-200 rounded-lg p-3 space-y-3">
              <div v-for="d in contractDevices" :key="d.id" class="bg-gray-50 rounded-lg p-3">
                <div class="text-sm font-medium mb-2">{{ d.model }} ({{ d.sn }})</div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs text-gray-400 mb-1">黑白印量</label>
                    <input v-model.number="meterReadings[d.id].b_w" type="number" min="0" placeholder="0" class="w-full px-2 py-1.5 border border-gray-200 rounded text-sm">
                  </div>
                  <div>
                    <label class="block text-xs text-gray-400 mb-1">彩色印量</label>
                    <input v-model.number="meterReadings[d.id].color" type="number" min="0" placeholder="0" class="w-full px-2 py-1.5 border border-gray-200 rounded text-sm">
                  </div>
                </div>
              </div>
              <div v-if="contractDevices.length === 0" class="text-xs text-gray-400 text-center py-2">该合同暂无关联设备</div>
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">备注</label>
            <textarea v-model="settleForm.note" rows="2" placeholder="可选备注信息" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
          </div>
          <div class="flex gap-3 pt-2">
            <button @click="settleForm=null" class="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">取消</button>
            <button @click="saveSettleForm" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">保存</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Delete -->
    <div v-if="delTarget" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" @click.self="delTarget=null">
      <div class="bg-white rounded-xl p-6 max-w-sm w-full text-center shadow-2xl">
        <div class="text-4xl mb-3">🗑️</div>
        <p class="text-gray-700 mb-5">确定删除此结算记录吗？</p>
        <div class="flex gap-3">
          <button @click="delTarget=null" class="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">取消</button>
          <button @click="doDelete" class="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600">确认删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, watch } from 'vue'
import { useAppStore } from '../stores/app'

const store = useAppStore()
const showToast = inject('showToast')

const kw = ref('')
const fStatus = ref('')
const fType = ref('')
const settleForm = ref(null)
const isEdit = ref(false)
const delTarget = ref(null)
const detail = ref(null)
const meterReadings = ref({})

const filtered = computed(() => {
  return store.settlements.filter(s => {
    const matchKw = !kw.value || store.getCustomerName(s.customer).includes(kw.value) || getContractTitle(s.contract).includes(kw.value)
    const matchStatus = !fStatus.value || s.status === fStatus.value
    const matchType = !fType.value || s.type === fType.value
    return matchKw && matchStatus && matchType
  })
})

const pendingSettlements = computed(() => store.settlements.filter(s => s.status === '待收款' || s.status === '待确认'))

const monthStats = computed(() => {
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const lastMonth = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`
  
  const current = store.settlements.filter(s => s.period === currentMonth && s.status === '已结算').reduce((sum, s) => sum + s.amount, 0)
  const last = store.settlements.filter(s => s.period === lastMonth && s.status === '已结算').reduce((sum, s) => sum + s.amount, 0)
  const pending = store.settlements.filter(s => s.status !== '已结算').reduce((sum, s) => sum + s.amount, 0)
  const total = store.settlements.filter(s => s.status === '已结算').reduce((sum, s) => sum + s.amount, 0)
  
  return [
    { label: '本月已结算', value: current },
    { label: '上月已结算', value: last },
    { label: '待结算金额', value: pending },
    { label: '累计已结算', value: total }
  ]
})

const customerContracts = computed(() => {
  if (!settleForm.value?.customer) return []
  return store.contracts.filter(c => c.customer === settleForm.value.customer && c.status === '生效中')
})

const contractDevices = computed(() => {
  if (!settleForm.value?.contract) return []
  const contract = store.contracts.find(c => c.id === settleForm.value.contract)
  if (!contract?.devices) return []
  return contract.devices.map(id => store.devices.find(d => d.id === id)).filter(Boolean)
})

function getContractTitle(contractId) {
  const c = store.contracts.find(x => x.id === contractId)
  return c ? c.title : '-'
}

function getDeviceName(deviceId) {
  const d = store.devices.find(x => x.id === deviceId)
  return d ? d.model : deviceId
}

function settlementStatusClass(status) {
  const map = {
    '待收款': 'bg-yellow-100 text-yellow-700',
    '待确认': 'bg-orange-100 text-orange-700',
    '已结算': 'bg-green-100 text-green-700'
  }
  return map[status] || 'bg-gray-100 text-gray-600'
}

function showDetail(s) { detail.value = s }

function showSettleForm(s) {
  meterReadings.value = {}
  if (s) {
    isEdit.value = true
    settleForm.value = { ...s }
    if (s.meterReadings) {
      meterReadings.value = JSON.parse(JSON.stringify(s.meterReadings))
    }
  } else {
    isEdit.value = false
    const now = new Date()
    settleForm.value = { 
      customer: '', 
      contract: '', 
      period: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`, 
      type: '合同结算', 
      amount: 0, 
      status: '待收款', 
      note: '' 
    }
  }
}

watch(() => settleForm.value?.contract, (newVal) => {
  if (newVal && !isEdit.value) {
    meterReadings.value = {}
    const contract = store.contracts.find(c => c.id === newVal)
    if (contract?.devices) {
      contract.devices.forEach(id => {
        meterReadings.value[id] = { b_w: 0, color: 0 }
      })
    }
  }
})

function saveSettleForm() {
  if (!settleForm.value.customer || !settleForm.value.contract || !settleForm.value.period || !settleForm.value.amount) {
    showToast('请填写必填项', 'error'); return
  }
  
  // 处理抄表数据
  const meterData = {}
  Object.keys(meterReadings.value).forEach(key => {
    if (meterReadings.value[key].b_w > 0 || meterReadings.value[key].color > 0) {
      meterData[key] = meterReadings.value[key]
    }
  })
  
  const data = { ...settleForm.value }
  if (Object.keys(meterData).length > 0) {
    data.meterReadings = meterData
  }
  
  if (isEdit.value) {
    store.updateSettlement(data.id, data)
    showToast('结算已更新')
  } else {
    store.addSettlement(data)
    showToast('结算已创建')
  }
  settleForm.value = null
}

function confirmPay(s) {
  store.updateSettlement(s.id, { status: '待确认', payDate: '' })
  showToast('已标记为待确认，等待客户确认')
}

function confirmSettlement(s) {
  store.updateSettlement(s.id, { status: '已结算', payDate: store.now() })
  showToast('结算已完成')
}

function confirmDel(s) { delTarget.value = s }
function doDelete() {
  store.deleteSettlement(delTarget.value.id)
  showToast('结算记录已删除')
  delTarget.value = null
}
</script>
