<template>
  <div class="space-y-4">
    <!-- 设备状态统计卡片 -->
    <div class="grid grid-cols-4 gap-4">
      <div v-for="s in deviceStats" :key="s.label"
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
      <input v-model="kw" type="text" placeholder="🔍 搜索型号/序列号/客户..." class="px-4 py-2 border border-gray-200 rounded-lg text-sm w-60 focus:outline-none focus:ring-2 focus:ring-blue-500">
      <select v-model="fStatus" class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">全部状态</option><option>正常</option><option>故障</option><option>维修中</option><option>报废</option>
      </select>
      <div class="ml-auto">
        <button @click="showForm(null)" class="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2">+ 新建设备</button>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-xs text-gray-400 uppercase border-b bg-gray-50/50">
            <th class="px-4 py-3 font-medium">型号</th><th class="px-4 py-3 font-medium">序列号</th>
            <th class="px-4 py-3 font-medium">客户</th><th class="px-4 py-3 font-medium">位置</th>
            <th class="px-4 py-3 font-medium">状态</th><th class="px-4 py-3 font-medium">安装日期</th>
            <th class="px-4 py-3 font-medium">操作</th>
          </tr>
        </thead>
        <tbody class="text-gray-700">
          <tr v-for="d in filtered" :key="d.id" class="border-b border-gray-50 hover:bg-blue-50/30 transition cursor-pointer" @click="showDetail(d)">
            <td class="px-4 py-3 font-medium">{{ d.model }}</td>
            <td class="px-4 py-3 font-mono text-xs text-gray-400">{{ d.sn }}</td>
            <td class="px-4 py-3">{{ store.getCustomerName(d.customer) }}</td>
            <td class="px-4 py-3 text-xs">{{ d.addr }}</td>
            <td class="px-4 py-3"><span :class="['inline-block px-2 py-0.5 rounded-full text-xs font-medium', store.badgeClass(d.status)]">{{ d.status }}</span></td>
            <td class="px-4 py-3 text-xs text-gray-400">{{ d.date }}</td>
            <td class="px-4 py-3" @click.stop>
              <button @click="showForm(d)" class="text-blue-500 hover:text-blue-700 text-xs mr-2">编辑</button>
              <button @click="confirmDel(d)" class="text-red-400 hover:text-red-600 text-xs">删除</button>
            </td>
          </tr>
          <tr v-if="filtered.length === 0">
            <td colspan="7" class="text-center py-12 text-gray-400"><div class="text-4xl mb-2">🖨️</div>暂无设备</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Detail Modal -->
    <div v-if="detail" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" @click.self="detail=null">
      <div class="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="flex items-center justify-between p-5 border-b">
          <h2 class="font-semibold text-gray-800">设备详情</h2>
          <button @click="detail=null" class="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div class="p-5">
          <div class="grid grid-cols-2 gap-3 mb-5">
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">型号</div><div class="text-sm font-medium">{{ detail.model }}</div></div>
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">序列号</div><div class="text-sm font-mono">{{ detail.sn }}</div></div>
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">客户</div><div class="text-sm">{{ store.getCustomerName(detail.customer) }}</div></div>
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">状态</div><span :class="['inline-block px-2 py-0.5 rounded-full text-xs font-medium', store.badgeClass(detail.status)]">{{ detail.status }}</span></div>
            <div class="bg-gray-50 rounded-lg p-3 col-span-2"><div class="text-xs text-gray-400 mb-1">安装位置</div><div class="text-sm">{{ detail.addr }}</div></div>
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">安装日期</div><div class="text-sm">{{ detail.date }}</div></div>
          </div>
          <!-- Maintenance History -->
          <div>
            <div class="text-xs font-medium text-gray-500 mb-3">关联工单</div>
            <div class="space-y-2">
              <div v-for="o in relatedOrders" :key="o.id" class="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg text-sm">
                <div><span class="font-mono text-xs text-blue-500 mr-2">{{ o.id }}</span>{{ o.title }}</div>
                <span :class="['inline-block px-2 py-0.5 rounded-full text-xs font-medium', store.badgeClass(o.status)]">{{ o.status }}</span>
              </div>
              <div v-if="relatedOrders.length === 0" class="text-center py-4 text-gray-400 text-xs">暂无维修记录</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Modal -->
    <div v-if="form" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" @click.self="form=null">
      <div class="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="flex items-center justify-between p-5 border-b">
          <h2 class="font-semibold text-gray-800">{{ isEdit?'编辑':'新建' }}设备</h2>
          <button @click="form=null" class="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div class="p-5 space-y-4">
          <div><label class="block text-xs font-medium text-gray-500 mb-1">设备型号 *</label>
            <input v-model="form.model" type="text" placeholder="例如：柯美 Bizhub 658e" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div><label class="block text-xs font-medium text-gray-500 mb-1">序列号 *</label>
            <input v-model="form.sn" type="text" placeholder="设备序列号" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div><label class="block text-xs font-medium text-gray-500 mb-1">所属客户 *</label>
            <select v-model="form.customer" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">选择客户</option>
              <option v-for="c in store.customers" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div><label class="block text-xs font-medium text-gray-500 mb-1">安装位置 *</label>
            <input v-model="form.addr" type="text" placeholder="例如：3楼办公室" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="block text-xs font-medium text-gray-500 mb-1">状态 *</label>
              <select v-model="form.status" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>正常</option><option>故障</option><option>维修中</option><option>报废</option>
              </select>
            </div>
            <div><label class="block text-xs font-medium text-gray-500 mb-1">安装日期</label>
              <input v-model="form.date" type="date" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
          </div>
          <div class="flex gap-3 pt-2">
            <button @click="form=null" class="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">取消</button>
            <button @click="saveForm" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">保存</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Delete -->
    <div v-if="delTarget" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl p-6 max-w-sm w-full text-center shadow-2xl">
        <div class="text-4xl mb-3">🗑️</div>
        <p class="text-gray-700 mb-5">确定删除设备 <b>{{ delTarget.model }}</b> 吗？</p>
        <div class="flex gap-3">
          <button @click="delTarget=null" class="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">取消</button>
          <button @click="doDelete" class="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600">确认删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { useAppStore } from '../stores/app'
const store = useAppStore()
const showToast = inject('showToast')

const kw = ref('')
const fStatus = ref('')
const detail = ref(null)
const form = ref(null)
const isEdit = ref(false)
const delTarget = ref(null)

// 设备状态统计
const deviceStats = computed(() => {
  const total = store.devices.length
  const normal = store.devices.filter(d => d.status === '正常').length
  const fault = store.devices.filter(d => d.status === '故障').length
  const repairing = store.devices.filter(d => d.status === '维修中').length
  return [
    { icon: '🖨️', iconBg: 'bg-blue-100', label: '全部设备', value: total, filterKey: '' },
    { icon: '✅', iconBg: 'bg-green-100', label: '正常', value: normal, filterKey: '正常' },
    { icon: '⚠️', iconBg: 'bg-red-100', label: '故障', value: fault, filterKey: '故障' },
    { icon: '🔧', iconBg: 'bg-orange-100', label: '维修中', value: repairing, filterKey: '维修中' },
  ]
})

const filtered = computed(() => {
  return store.devices.filter(d => {
    const matchKw = !kw.value || d.model.includes(kw.value) || d.sn.includes(kw.value) || store.getCustomerName(d.customer).includes(kw.value)
    const matchStatus = !fStatus.value || d.status === fStatus.value
    return matchKw && matchStatus
  })
})

const relatedOrders = computed(() => {
  if (!detail.value) return []
  return store.orders.filter(o => o.device === detail.value.id)
})

function showDetail(d) { detail.value = d }

function showForm(d) {
  if (d) { isEdit.value = true; form.value = { ...d } }
  else { isEdit.value = false; form.value = { model: '', sn: '', customer: '', addr: '', status: '正常', date: store.now() } }
}

function saveForm() {
  if (!form.value.model || !form.value.sn || !form.value.customer || !form.value.addr) { showToast('请填写必填项', 'error'); return }
  if (isEdit.value) {
    const idx = store.devices.findIndex(x => x.id === form.value.id)
    if (idx > -1) store.devices[idx] = { ...form.value }
    showToast('设备已更新')
  } else {
    store.addDevice(form.value)
    showToast('设备已创建')
  }
  form.value = null
}

function confirmDel(d) { delTarget.value = d }
function doDelete() {
  store.deleteDevice(delTarget.value.id)
  showToast('设备已删除')
  delTarget.value = null
}
</script>
