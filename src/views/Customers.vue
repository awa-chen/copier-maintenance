<template>
  <div class="space-y-4">
    <div class="flex gap-3 items-center flex-wrap">
      <input v-model="kw" type="text" placeholder="🔍 搜索公司名/联系人/电话..." class="px-4 py-2 border border-gray-200 rounded-lg text-sm w-60 focus:outline-none focus:ring-2 focus:ring-blue-500">
      <div class="ml-auto">
        <button @click="showForm(null)" class="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2">+ 新建客户</button>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-xs text-gray-400 uppercase border-b bg-gray-50/50">
            <th class="px-4 py-3 font-medium">公司名称</th><th class="px-4 py-3 font-medium">联系人</th>
            <th class="px-4 py-3 font-medium">联系电话</th><th class="px-4 py-3 font-medium">地址</th>
            <th class="px-4 py-3 font-medium">设备数量</th><th class="px-4 py-3 font-medium">备注</th>
            <th class="px-4 py-3 font-medium">操作</th>
          </tr>
        </thead>
        <tbody class="text-gray-700">
          <tr v-for="c in filtered" :key="c.id" class="border-b border-gray-50 hover:bg-blue-50/30 transition cursor-pointer" @click="showDetail(c)">
            <td class="px-4 py-3 font-medium">{{ c.name }}</td>
            <td class="px-4 py-3">{{ c.contact }}</td>
            <td class="px-4 py-3 font-mono text-xs">{{ c.phone }}</td>
            <td class="px-4 py-3 text-xs">{{ c.addr }}</td>
            <td class="px-4 py-3"><span class="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-medium">{{ deviceCount(c.id) }}台</span></td>
            <td class="px-4 py-3 text-xs text-gray-400">{{ c.note }}</td>
            <td class="px-4 py-3" @click.stop>
              <button @click="showForm(c)" class="text-blue-500 hover:text-blue-700 text-xs mr-2">编辑</button>
              <button @click="confirmDel(c)" class="text-red-400 hover:text-red-600 text-xs">删除</button>
            </td>
          </tr>
          <tr v-if="filtered.length === 0">
            <td colspan="7" class="text-center py-12 text-gray-400"><div class="text-4xl mb-2">👥</div>暂无客户</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Detail Modal -->
    <div v-if="detail" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" @click.self="detail=null">
      <div class="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="flex items-center justify-between p-5 border-b">
          <h2 class="font-semibold text-gray-800">客户详情</h2>
          <button @click="detail=null" class="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div class="p-5">
          <div class="grid grid-cols-2 gap-3 mb-5">
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">公司名称</div><div class="text-sm font-medium">{{ detail.name }}</div></div>
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">联系人</div><div class="text-sm">{{ detail.contact }}</div></div>
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">联系电话</div><div class="text-sm font-mono">{{ detail.phone }}</div></div>
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">备注</div><div class="text-sm text-gray-500">{{ detail.note }}</div></div>
            <div class="bg-gray-50 rounded-lg p-3 col-span-2"><div class="text-xs text-gray-400 mb-1">地址</div><div class="text-sm">{{ detail.addr }}</div></div>
          </div>
          <!-- Devices -->
          <div class="mb-5">
            <div class="text-xs font-medium text-gray-500 mb-3">名下设备 ({{ deviceCount(detail.id) }})</div>
            <div class="space-y-2">
              <div v-for="d in customerDevices" :key="d.id" class="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                <div><span class="font-medium text-sm">{{ d.model }}</span><span class="text-xs text-gray-400 ml-2 font-mono">{{ d.sn }}</span></div>
                <span :class="['inline-block px-2 py-0.5 rounded-full text-xs font-medium', store.badgeClass(d.status)]">{{ d.status }}</span>
              </div>
              <div v-if="customerDevices.length === 0" class="text-center py-3 text-gray-400 text-xs">暂无设备</div>
            </div>
          </div>
          <!-- Orders -->
          <div>
            <div class="text-xs font-medium text-gray-500 mb-3">工单历史 ({{ customerOrders.length }})</div>
            <div class="space-y-2">
              <div v-for="o in customerOrders" :key="o.id" class="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg text-sm">
                <div><span class="font-mono text-xs text-blue-500 mr-2">{{ o.id }}</span>{{ o.title }}</div>
                <span :class="['inline-block px-2 py-0.5 rounded-full text-xs font-medium', store.badgeClass(o.status)]">{{ o.status }}</span>
              </div>
              <div v-if="customerOrders.length === 0" class="text-center py-3 text-gray-400 text-xs">暂无工单</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Modal -->
    <div v-if="form" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" @click.self="form=null">
      <div class="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="flex items-center justify-between p-5 border-b">
          <h2 class="font-semibold text-gray-800">{{ isEdit?'编辑':'新建' }}客户</h2>
          <button @click="form=null" class="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div class="p-5 space-y-4">
          <div><label class="block text-xs font-medium text-gray-500 mb-1">公司名称 *</label>
            <input v-model="form.name" type="text" placeholder="公司全称" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div><label class="block text-xs font-medium text-gray-500 mb-1">联系人 *</label>
            <input v-model="form.contact" type="text" placeholder="联系人姓名" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div><label class="block text-xs font-medium text-gray-500 mb-1">联系电话 *</label>
            <input v-model="form.phone" type="text" placeholder="手机或座机" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div><label class="block text-xs font-medium text-gray-500 mb-1">公司地址 *</label>
            <input v-model="form.addr" type="text" placeholder="详细地址" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div><label class="block text-xs font-medium text-gray-500 mb-1">备注</label>
            <input v-model="form.note" type="text" placeholder="备注信息（选填）" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
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
        <p class="text-gray-700 mb-5">确定删除客户 <b>{{ delTarget.name }}</b> 吗？</p>
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
const detail = ref(null)
const form = ref(null)
const isEdit = ref(false)
const delTarget = ref(null)

const filtered = computed(() => {
  return store.customers.filter(c => {
    if (!kw.value) return true
    const k = kw.value.toLowerCase()
    return c.name.toLowerCase().includes(k) || c.contact.includes(k) || c.phone.includes(k)
  })
})

const customerDevices = computed(() => detail.value ? store.devices.filter(d => d.customer === detail.value.id) : [])
const customerOrders = computed(() => detail.value ? store.orders.filter(o => o.customer === detail.value.id).slice(0,5) : [])
function deviceCount(id) { return store.devices.filter(d => d.customer === id).length }

function showDetail(c) { detail.value = c }
function showForm(c) {
  if (c) { isEdit.value = true; form.value = { ...c } }
  else { isEdit.value = false; form.value = { name: '', contact: '', phone: '', addr: '', note: '' } }
}
function saveForm() {
  if (!form.value.name || !form.value.contact || !form.value.phone || !form.value.addr) { showToast('请填写必填项', 'error'); return }
  if (isEdit.value) {
    const idx = store.customers.findIndex(x => x.id === form.value.id)
    if (idx > -1) store.customers[idx] = { ...form.value }
    showToast('客户已更新')
  } else {
    store.addCustomer(form.value)
    showToast('客户已创建')
  }
  form.value = null
}
function confirmDel(c) { delTarget.value = c }
function doDelete() {
  store.deleteCustomer(delTarget.value.id)
  showToast('客户已删除')
  delTarget.value = null
}
</script>
