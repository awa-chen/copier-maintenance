<template>
  <div class="space-y-4">
    <!-- Toolbar -->
    <div class="flex gap-3 items-center flex-wrap">
      <input v-model="kw" type="text" placeholder="🔍 搜索工单号/标题/客户..." class="px-4 py-2 border border-gray-200 rounded-lg text-sm w-60 focus:outline-none focus:ring-2 focus:ring-blue-500">
      <select v-model="fStatus" class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">全部状态</option>
        <option>待处理</option><option>处理中</option><option>待验收</option><option>已完成</option><option>已关闭</option>
      </select>
      <select v-model="fPriority" class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">全部优先级</option>
        <option>紧急</option><option>高</option><option>普通</option><option>低</option>
      </select>
      <div class="ml-auto">
        <button v-if="store.isAdmin" @click="showForm(null)" class="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2">
          + 新建工单
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl shadow-sm">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-xs text-gray-400 uppercase border-b bg-gray-50/50">
            <th class="px-4 py-3 font-medium">工单号</th>
            <th class="px-4 py-3 font-medium">标题</th>
            <th class="px-4 py-3 font-medium">客户</th>
            <th class="px-4 py-3 font-medium">设备</th>
            <th class="px-4 py-3 font-medium">优先级</th>
            <th class="px-4 py-3 font-medium">状态</th>
            <th class="px-4 py-3 font-medium">技术员</th>
            <th class="px-4 py-3 font-medium">日期</th>
            <th class="px-4 py-3 font-medium">操作</th>
          </tr>
        </thead>
        <tbody class="text-gray-700">
          <tr v-for="o in filtered" :key="o.id" class="border-b border-gray-50 hover:bg-blue-50/30 transition cursor-pointer"
            @click="showDetail(o)">
            <td class="px-4 py-3 font-mono text-xs text-blue-600">{{ o.id }}</td>
            <td class="px-4 py-3 font-medium">{{ o.title }}</td>
            <td class="px-4 py-3">{{ store.getCustomerName(o.customer) }}</td>
            <td class="px-4 py-3 text-xs">{{ store.getDeviceName(o.device) }}</td>
            <td class="px-4 py-3"><span :class="['inline-block px-2 py-0.5 rounded-full text-xs font-medium', store.priorityClass(o.priority)]">{{ o.priority }}</span></td>
            <td class="px-4 py-3"><span :class="['inline-block px-2 py-0.5 rounded-full text-xs font-medium', store.badgeClass(o.status)]">{{ o.status }}</span></td>
            <td class="px-4 py-3"><span v-if="!o.assignee" class="text-gray-300">未派</span>{{ o.assignee }}</td>
            <td class="px-4 py-3 text-xs text-gray-400">{{ o.created }}</td>
            <td class="px-4 py-3" @click.stop>
              <button v-if="store.isAdmin" @click="showForm(o)" class="text-blue-500 hover:text-blue-700 text-xs mr-2">编辑</button>
              <button v-if="store.isAdmin" @click="confirmDel(o)" class="text-red-400 hover:text-red-600 text-xs">删除</button>
            </td>
          </tr>
          <tr v-if="filtered.length === 0">
            <td colspan="9" class="text-center py-12 text-gray-400">
              <div class="text-4xl mb-2">📋</div>暂无工单
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Detail Modal -->
    <div v-if="detail" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" @click.self="detail=null">
      <div class="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="flex items-center justify-between p-5 border-b">
          <h2 class="font-semibold text-gray-800">工单详情 — <span class="text-blue-600 font-mono text-sm">{{ detail.id }}</span></h2>
          <button @click="detail=null" class="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div class="p-5">
          <div class="grid grid-cols-2 gap-3 mb-5">
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">标题</div><div class="text-sm font-medium">{{ detail.title }}</div></div>
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">状态</div><span :class="['inline-block px-2 py-0.5 rounded-full text-xs font-medium', store.badgeClass(detail.status)]">{{ detail.status }}</span></div>
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">客户</div><div class="text-sm">{{ store.getCustomerName(detail.customer) }}</div></div>
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">设备</div><div class="text-sm">{{ store.getDeviceName(detail.device) }}</div></div>
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">优先级</div><span :class="['inline-block px-2 py-0.5 rounded-full text-xs font-medium', store.priorityClass(detail.priority)]">{{ detail.priority }}</span></div>
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">技术员</div><div class="text-sm">{{ detail.assignee || '未指派' }}</div></div>
            <div class="bg-gray-50 rounded-lg p-3 col-span-2"><div class="text-xs text-gray-400 mb-1">描述</div><div class="text-sm">{{ detail.desc }}</div></div>
          </div>

          <!-- Quick Status Update -->
          <div v-if="store.isAdmin" class="mb-5">
            <div class="text-xs font-medium text-gray-500 mb-2">快速更新状态</div>
            <div class="flex gap-2 flex-wrap">
              <button v-for="s in ['待处理','处理中','待验收','已完成','已关闭']" :key="s"
                @click="quickUpdate(detail, s)"
                :class="['px-3 py-1.5 rounded-lg text-xs border transition',
                  detail.status === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400']">
                {{ s }}
              </button>
            </div>
          </div>

          <!-- 配件使用 -->
          <div class="mb-5">
            <div class="flex items-center justify-between mb-2">
              <div class="text-xs font-medium text-gray-500">更换配件</div>
              <button @click="showPartForm" class="text-xs text-blue-500 hover:text-blue-700">+ 添加配件</button>
            </div>
            <div v-if="orderParts.length > 0" class="space-y-2">
              <div v-for="p in orderParts" :key="p.id" class="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                <div>
                  <span class="text-sm font-medium">{{ p.partName }}</span>
                  <span class="text-xs text-gray-400 ml-2">x{{ p.qty }}</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-xs text-gray-500">¥{{ p.price }}</span>
                  <span class="text-xs text-gray-400">{{ p.date }}</span>
                </div>
              </div>
              <div class="text-right text-xs text-gray-500 pt-1 border-t">
                配件费用合计: <span class="font-medium text-gray-700">¥{{ orderPartsTotal }}</span>
              </div>
            </div>
            <div v-else class="text-xs text-gray-400 bg-gray-50 rounded-lg p-3 text-center">暂无配件使用记录</div>
          </div>

          <!-- Logs -->
          <div>
            <div class="text-xs font-medium text-gray-500 mb-3">处理日志</div>
            <div class="space-y-3">
              <div v-for="(log, i) in detail.logs" :key="i" class="flex gap-3">
                <div class="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-0.5">
                    <span class="text-xs font-medium text-blue-600">{{ log.n }}</span>
                    <span class="text-xs text-gray-300">{{ log.t }}</span>
                  </div>
                  <div class="text-sm text-gray-600">{{ log.m }}</div>
                </div>
              </div>
            </div>
            <div class="mt-4 flex gap-2">
              <input v-model="newLog" placeholder="添加处理备注..." class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <button @click="addLog(detail, newLog)" :disabled="!newLog.trim()" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-40 transition">添加</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Part Form Modal -->
    <div v-if="partForm" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" @click.self="partForm=null">
      <div class="bg-white rounded-xl w-full max-w-md shadow-2xl">
        <div class="flex items-center justify-between p-5 border-b">
          <h2 class="font-semibold text-gray-800">添加使用配件</h2>
          <button @click="partForm=null" class="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div class="p-5 space-y-4">
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">选择配件 *</label>
            <select v-model="partForm.partId" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">选择配件</option>
              <option v-for="p in availableParts" :key="p.id" :value="p.id">{{ p.name }} (库存: {{ p.stock }}{{ p.unit }})</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">数量 *</label>
              <input v-model.number="partForm.qty" type="number" min="1" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">单价</label>
              <div class="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600">¥{{ selectedPartPrice }}</div>
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">备注</label>
            <input v-model="partForm.note" type="text" placeholder="更换原因..." class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div class="flex gap-3 pt-2">
            <button @click="partForm=null" class="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">取消</button>
            <button @click="savePart" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">确认使用</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Delete -->
    <div v-if="form" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" @click.self="form=null">
      <div class="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="flex items-center justify-between p-5 border-b">
          <h2 class="font-semibold text-gray-800">{{ isEdit ? '编辑' : '新建' }}工单</h2>
          <button @click="form=null" class="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div class="p-5 space-y-4">
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">工单标题 *</label>
            <input v-model="form.title" type="text" placeholder="简要描述故障或服务内容" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
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
              <label class="block text-xs font-medium text-gray-500 mb-1">关联设备 *</label>
              <select v-model="form.device" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">先选客户</option>
                <option v-for="d in deviceOptions" :key="d.id" :value="d.id">{{ d.model }}</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">优先级 *</label>
              <select v-model="form.priority" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>紧急</option><option>高</option><option>普通</option><option>低</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">状态</label>
              <select v-model="form.status" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>待处理</option><option>处理中</option><option>待验收</option><option>已完成</option><option>已关闭</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">指派技术员</label>
            <select v-model="form.assignee" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">未指派</option>
              <option v-for="t in store.techs" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">故障/服务描述 *</label>
            <textarea v-model="form.desc" rows="3" placeholder="详细描述..." class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
          </div>
          <div class="flex gap-3 pt-2">
            <button @click="form=null" class="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">取消</button>
            <button @click="saveForm" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">保存</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Delete -->
    <div v-if="delTarget" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" @click.self="delTarget=null">
      <div class="bg-white rounded-xl p-6 max-w-sm w-full text-center shadow-2xl">
        <div class="text-4xl mb-3">🗑️</div>
        <p class="text-gray-700 mb-5">确定删除工单 <b>{{ delTarget.id }}</b> 吗？此操作不可恢复。</p>
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
const fPriority = ref('')
const detail = ref(null)
const form = ref(null)
const isEdit = ref(false)
const newLog = ref('')
const delTarget = ref(null)
const partForm = ref(null)

// 配件相关
const orderParts = computed(() => {
  if (!detail.value) return []
  return store.partUsages.filter(p => p.order === detail.value.id)
})

const orderPartsTotal = computed(() => orderParts.value.reduce((sum, p) => sum + p.price, 0))

const availableParts = computed(() => store.parts.filter(p => p.stock > 0))

const selectedPartPrice = computed(() => {
  if (!partForm.value?.partId) return 0
  const part = store.parts.find(p => p.id === partForm.value.partId)
  return part ? part.price : 0
})

const filtered = computed(() => {
  const list = store.isAdmin ? store.orders : store.visibleOrders
  return list.filter(o => {
    const matchKw = !kw.value || o.title.includes(kw.value) || o.id.includes(kw.value) || store.getCustomerName(o.customer).includes(kw.value)
    const matchStatus = !fStatus.value || o.status === fStatus.value
    const matchPriority = !fPriority.value || o.priority === fPriority.value
    return matchKw && matchStatus && matchPriority
  })
})

const deviceOptions = computed(() => {
  if (!form.value?.customer) return []
  return store.devices.filter(d => d.customer === form.value.customer)
})

function showDetail(o) { detail.value = o; newLog.value = '' }
function showForm(o) {
  if (o) {
    isEdit.value = true
    form.value = { ...o }
  } else {
    isEdit.value = false
    form.value = { title: '', customer: '', device: '', priority: '普通', status: '待处理', assignee: '', desc: '' }
  }
}

function saveForm() {
  if (!form.value.title || !form.value.customer || !form.value.device || !form.value.desc) {
    showToast('请填写必填项', 'error'); return
  }
  if (isEdit.value) {
    store.updateOrder(form.value.id, form.value)
    showToast('工单已更新')
  } else {
    store.addOrder(form.value)
    showToast('工单已创建')
  }
  form.value = null
}

function quickUpdate(o, status) {
  store.updateOrder(o.id, { status })
  detail.value = store.orders.find(x => x.id === o.id)
  showToast(`状态已更新为：${status}`)
}

function addLog(o, text) {
  if (!text.trim()) return
  const logs = [...o.logs, { t: store.now() + ' ' + new Date().toLocaleTimeString().slice(0,5), n: store.user.name, m: text.trim() }]
  store.updateOrder(o.id, { logs })
  detail.value = store.orders.find(x => x.id === o.id)
  newLog.value = ''
  showToast('备注已添加')
}

function confirmDel(o) { delTarget.value = o }
function doDelete() {
  store.deleteOrder(delTarget.value.id)
  showToast('工单已删除')
  delTarget.value = null
}

// 配件使用
function showPartForm() {
  partForm.value = { partId: '', qty: 1, note: '' }
}

function savePart() {
  if (!partForm.value.partId || !partForm.value.qty || partForm.value.qty < 1) {
    showToast('请选择配件并填写数量', 'error')
    return
  }
  const part = store.parts.find(p => p.id === partForm.value.partId)
  if (part.stock < partForm.value.qty) {
    showToast(`库存不足，当前库存: ${part.stock}${part.unit}`, 'error')
    return
  }
  
  const success = store.usePart({
    part: partForm.value.partId,
    order: detail.value.id,
    device: detail.value.device,
    qty: partForm.value.qty,
    user: store.user.name,
    note: partForm.value.note
  })
  
  if (success) {
    showToast(`已使用 ${part.name} x${partForm.value.qty}`)
    // 添加日志
    addLog(detail.value, `更换配件: ${part.name} x${partForm.value.qty}`)
    partForm.value = null
  } else {
    showToast('配件使用失败', 'error')
  }
}
</script>
