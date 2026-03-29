<template>
  <div class="space-y-4">
    <div class="flex gap-3 items-center flex-wrap">
      <input v-model="kw" type="text" placeholder="🔍 搜索设备/客户..." class="px-4 py-2 border border-gray-200 rounded-lg text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-500">
      <select v-model="fCyc" class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">全部周期</option>
        <option>每日</option><option>每周</option><option>每月</option>
      </select>
      <div class="ml-auto">
        <button @click="showForm(null)" class="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2">
          + 新建巡检
        </button>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-xs text-gray-400 uppercase border-b bg-gray-50/50">
            <th class="px-4 py-3 font-medium">设备</th>
            <th class="px-4 py-3 font-medium">客户</th>
            <th class="px-4 py-3 font-medium">周期</th>
            <th class="px-4 py-3 font-medium">负责人</th>
            <th class="px-4 py-3 font-medium">上次巡检</th>
            <th class="px-4 py-3 font-medium">下次巡检</th>
            <th class="px-4 py-3 font-medium">状态</th>
            <th class="px-4 py-3 font-medium">操作</th>
          </tr>
        </thead>
        <tbody class="text-gray-700">
          <tr v-for="i in filtered" :key="i.id" class="border-b border-gray-50 hover:bg-blue-50/30 transition cursor-pointer"
            @click="showRecord(i)">
            <td class="px-4 py-3">
              <div class="font-medium">{{ store.getDeviceName(i.device) }}</div>
              <div class="text-xs text-gray-400 font-mono">{{ store.getDevice(i.device)?.sn }}</div>
            </td>
            <td class="px-4 py-3">{{ store.getCustomerName(i.customer) }}</td>
            <td class="px-4 py-3">
              <span class="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-medium">{{ i.cycle }}</span>
            </td>
            <td class="px-4 py-3">{{ i.assignee }}</td>
            <td class="px-4 py-3 text-xs text-gray-400">{{ i.lastDate }}</td>
            <td class="px-4 py-3 text-xs font-medium text-gray-700">{{ i.nextDate }}</td>
            <td class="px-4 py-3">
              <span :class="['inline-block px-2 py-0.5 rounded-full text-xs font-medium', store.badgeClass(i.status)]">{{ i.status }}</span>
            </td>
            <td class="px-4 py-3" @click.stop>
              <button @click="showRecord(i)" class="bg-green-50 text-green-600 px-2 py-1 rounded text-xs hover:bg-green-100 mr-1">记录</button>
              <button @click="showForm(i)" class="text-blue-500 hover:text-blue-700 text-xs mr-1">编辑</button>
              <button @click="confirmDel(i)" class="text-red-400 hover:text-red-600 text-xs">删除</button>
            </td>
          </tr>
          <tr v-if="filtered.length === 0">
            <td colspan="8" class="text-center py-12 text-gray-400">
              <div class="text-4xl mb-2">🔍</div>
              暂无巡检记录
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Record Modal -->
    <div v-if="record" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" @click.self="record=null">
      <div class="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="flex items-center justify-between p-5 border-b">
          <h2 class="font-semibold text-gray-800">巡检记录</h2>
          <button @click="record=null" class="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div class="p-5">
          <div class="bg-gray-50 rounded-lg p-3 mb-4">
            <div class="text-xs text-gray-400 mb-1">设备</div>
            <div class="text-sm font-medium">{{ store.getDeviceName(record.device) }}</div>
            <div class="text-xs text-gray-400 mt-1">客户：{{ store.getCustomerName(record.customer) }}</div>
            <div class="text-xs text-gray-400">负责人：{{ record.assignee }}</div>
          </div>
          
          <!-- 巡检明细项 -->
          <div class="mb-4">
            <div class="text-xs font-medium text-gray-500 mb-2">巡检明细</div>
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <label class="w-28 text-xs text-gray-600">外观清洁保养</label>
                <select v-model="recordDetail.appearance" class="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">请选择</option>
                  <option value="正常">✅ 正常</option>
                  <option value="需清洁">⚠️ 需清洁</option>
                  <option value="异常">❌ 异常</option>
                </select>
              </div>
              <div class="flex items-center gap-3">
                <label class="w-28 text-xs text-gray-600">打印质量检测</label>
                <select v-model="recordDetail.printQuality" class="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">请选择</option>
                  <option value="正常">✅ 正常</option>
                  <option value="轻微偏色">⚠️ 轻微偏色</option>
                  <option value="条纹/斑点">⚠️ 条纹/斑点</option>
                  <option value="异常">❌ 异常</option>
                </select>
              </div>
              <div class="flex items-center gap-3">
                <label class="w-28 text-xs text-gray-600">纸路检测</label>
                <select v-model="recordDetail.paperPath" class="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">请选择</option>
                  <option value="正常">✅ 正常</option>
                  <option value="轻微磨损">⚠️ 轻微磨损</option>
                  <option value="需更换配件">❌ 需更换配件</option>
                </select>
              </div>
              <div class="flex items-center gap-3">
                <label class="w-28 text-xs text-gray-600">定影检测</label>
                <select v-model="recordDetail.fuser" class="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">请选择</option>
                  <option value="正常">✅ 正常</option>
                  <option value="温度偏高">⚠️ 温度偏高</option>
                  <option value="需清洁">⚠️ 需清洁</option>
                  <option value="异常">❌ 异常</option>
                </select>
              </div>
              <div class="flex items-center gap-3">
                <label class="w-28 text-xs text-gray-600">粉量检查</label>
                <select v-model="recordDetail.tonerLevel" class="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">请选择</option>
                  <option value="充足">✅ 充足</option>
                  <option value="正常">✅ 正常</option>
                  <option value="偏低">⚠️ 偏低</option>
                  <option value="需更换">❌ 需更换</option>
                </select>
              </div>
              <div class="flex items-center gap-3">
                <label class="w-28 text-xs text-gray-600">备用粉数量</label>
                <input v-model.number="recordDetail.spareToner" type="number" min="0" max="99" class="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="备用碳粉数量">
              </div>
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">备注说明</label>
            <textarea v-model="recordResult" rows="2" placeholder="其他发现的问题或备注..." class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
          </div>
          <div class="flex gap-3 mt-4">
            <button @click="record=null" class="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">取消</button>
            <button @click="saveRecord" class="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">完成巡检</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Modal -->
    <div v-if="form" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" @click.self="form=null">
      <div class="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="flex items-center justify-between p-5 border-b">
          <h2 class="font-semibold text-gray-800">{{ isEdit ? '编辑' : '新建' }}巡检计划</h2>
          <button @click="form=null" class="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div class="p-5 space-y-4">
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">客户 *</label>
            <select v-model="form.customer" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">选择客户</option>
              <option v-for="c in store.customers" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">设备 *</label>
            <select v-model="form.device" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" :disabled="!form.customer">
              <option value="">{{ form.customer ? '选择设备' : '请先选择客户' }}</option>
              <option v-for="d in customerDevices" :key="d.id" :value="d.id">{{ d.model }} ({{ d.sn }})</option>
            </select>
            <div v-if="!form.customer" class="text-xs text-gray-400 mt-1">请先选择客户，再选择该客户下的设备</div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">周期 *</label>
              <select v-model="form.cycle" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>每日</option><option>每周</option><option>每月</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">负责人 *</label>
              <select v-model="form.assignee" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option v-for="t in store.inspectionAssignees" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">上次巡检</label>
              <input v-model="form.lastDate" type="date" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">下次巡检</label>
              <input v-model="form.nextDate" type="date" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
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
    <div v-if="delTarget" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" @click.self="delTarget=null">
      <div class="bg-white rounded-xl p-6 max-w-sm w-full text-center shadow-2xl">
        <div class="text-4xl mb-3">🗑️</div>
        <p class="text-gray-700 mb-5">确定删除此巡检计划吗？</p>
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
const fCyc = ref('')
const form = ref(null)
const isEdit = ref(false)
const record = ref(null)
const recordResult = ref('')
const delTarget = ref(null)

// 巡检明细数据
const recordDetail = ref({
  appearance: '',
  printQuality: '',
  paperPath: '',
  fuser: '',
  tonerLevel: '',
  spareToner: 0
})

// 默认明细模板
const defaultDetail = {
  appearance: '',
  printQuality: '',
  paperPath: '',
  fuser: '',
  tonerLevel: '',
  spareToner: 0
}

const filtered = computed(() => {
  return store.inspections.filter(i => {
    const matchKw = !kw.value || store.getDeviceName(i.device).includes(kw.value) || store.getCustomerName(i.customer).includes(kw.value)
    const matchCyc = !fCyc.value || i.cycle === fCyc.value
    return matchKw && matchCyc
  })
})

// 根据选中的客户筛选设备列表
const customerDevices = computed(() => {
  if (!form.value?.customer) return []
  return store.devices.filter(d => d.customer === form.value.customer)
})

// 监听客户变更，清空设备选择（防止设备不属于新客户）
watch(() => form.value?.customer, (newVal, oldVal) => {
  if (form.value && oldVal && newVal !== oldVal) {
    form.value.device = ''
  }
})

function showForm(o) {
  if (o) {
    isEdit.value = true
    form.value = { ...o }
  } else {
    isEdit.value = false
    form.value = { device: '', customer: '', cycle: '每月', assignee: store.inspectionAssignees[0] || '', lastDate: store.now(), nextDate: '', status: '待巡检', result: '' }
  }
}

function saveForm() {
  if (!form.value.device || !form.value.customer || !form.value.nextDate) { showToast('请填写必填项', 'error'); return }
  if (isEdit.value) {
    const idx = store.inspections.findIndex(x => x.id === form.value.id)
    if (idx > -1) store.inspections[idx] = { ...form.value }
    showToast('巡检计划已更新')
  } else {
    store.addInspection(form.value)
    showToast('巡检计划已创建')
  }
  form.value = null
}

function showRecord(i) {
  record.value = { ...i }
  recordResult.value = i.detail?.note || ''
  recordDetail.value = i.detail ? { ...i.detail } : { ...defaultDetail }
}

function saveRecord() {
  // 至少填写一项巡检明细
  const hasDetail = Object.entries(recordDetail.value).some(([k, v]) => k !== 'spareToner' && v)
  if (!hasDetail && !recordResult.value.trim()) {
    showToast('请至少填写一项巡检明细或备注', 'error')
    return
  }
  
  const idx = store.inspections.findIndex(x => x.id === record.value.id)
  if (idx > -1) {
    // 生成巡检结果摘要
    const detailParts = []
    if (recordDetail.value.appearance) detailParts.push(`外观:${recordDetail.value.appearance}`)
    if (recordDetail.value.printQuality) detailParts.push(`打印质量:${recordDetail.value.printQuality}`)
    if (recordDetail.value.paperPath) detailParts.push(`纸路:${recordDetail.value.paperPath}`)
    if (recordDetail.value.fuser) detailParts.push(`定影:${recordDetail.value.fuser}`)
    if (recordDetail.value.tonerLevel) detailParts.push(`粉量:${recordDetail.value.tonerLevel}`)
    if (recordDetail.value.spareToner !== undefined && recordDetail.value.spareToner !== null) {
      detailParts.push(`备用粉:${recordDetail.value.spareToner}支`)
    }
    
    const resultSummary = detailParts.join(' | ') + (recordResult.value.trim() ? ` | 备注:${recordResult.value.trim()}` : '')
    
    store.inspections[idx] = {
      ...store.inspections[idx],
      status: '已完成',
      result: resultSummary,
      detail: { ...recordDetail.value, note: recordResult.value.trim() },
      lastDate: store.inspections[idx].nextDate,
    }
  }
  showToast('巡检记录已保存')
  record.value = null
}

function confirmDel(i) { delTarget.value = i }
function doDelete() {
  store.deleteInspection(delTarget.value.id)
  showToast('已删除')
  delTarget.value = null
}
</script>
