<template>
  <div class="space-y-4">
    <div class="flex gap-3 items-center flex-wrap">
      <input v-model="kw" type="text" placeholder="搜索配件名称/型号..." class="px-4 py-2 border border-gray-200 rounded-lg text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-500">
      <select v-model="fCat" class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">全部类别</option>
        <option v-for="c in store.partCategories" :key="c">{{ c }}</option>
      </select>
      <select v-model="fStock" class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">全部库存</option>
        <option value="low">库存不足</option>
        <option value="ok">库存正常</option>
      </select>
      <div class="ml-auto">
        <button @click="showForm(null)" class="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">+ 新增配件</button>
      </div>
    </div>

    <!-- 库存预警提示 -->
    <div v-if="lowStockParts.length > 0" class="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center gap-2">
      <span class="text-orange-500">⚠️</span>
      <span class="text-sm text-orange-700">{{ lowStockParts.length }} 种配件库存不足，请及时补充</span>
    </div>

    <div class="bg-white rounded-xl shadow-sm">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-xs text-gray-400 uppercase border-b bg-gray-50/50">
            <th class="px-4 py-3 font-medium">配件名称</th>
            <th class="px-4 py-3 font-medium">型号</th>
            <th class="px-4 py-3 font-medium">类别</th>
            <th class="px-4 py-3 font-medium">库存</th>
            <th class="px-4 py-3 font-medium">单价</th>
            <th class="px-4 py-3 font-medium">供应商</th>
            <th class="px-4 py-3 font-medium">操作</th>
          </tr>
        </thead>
        <tbody class="text-gray-700">
          <tr v-for="p in filtered" :key="p.id" class="border-b border-gray-50 hover:bg-blue-50/30 transition cursor-pointer"
            @click="showDetail(p)">
            <td class="px-4 py-3">
              <div class="font-medium">{{ p.name }}</div>
              <div v-if="p.note" class="text-xs text-gray-400">{{ p.note }}</div>
            </td>
            <td class="px-4 py-3 font-mono text-xs">{{ p.model }}</td>
            <td class="px-4 py-3">
              <span class="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{{ p.category }}</span>
            </td>
            <td class="px-4 py-3">
              <span :class="['font-medium', p.stock <= p.minStock ? 'text-red-600' : 'text-gray-700']">{{ p.stock }}</span>
              <span class="text-xs text-gray-400">/{{ p.unit }}</span>
              <span v-if="p.stock <= p.minStock" class="ml-1 text-xs text-red-500">⚠️</span>
            </td>
            <td class="px-4 py-3">¥{{ p.price }}</td>
            <td class="px-4 py-3 text-xs">{{ p.supplier }}</td>
            <td class="px-4 py-3" @click.stop>
              <button @click="showRestock(p)" class="bg-green-50 text-green-600 px-2 py-1 rounded text-xs hover:bg-green-100 mr-1">入库</button>
              <button @click="showForm(p)" class="text-blue-500 hover:text-blue-700 text-xs mr-1">编辑</button>
              <button @click="confirmDel(p)" class="text-red-400 hover:text-red-600 text-xs">删除</button>
            </td>
          </tr>
          <tr v-if="filtered.length === 0">
            <td colspan="7" class="text-center py-12 text-gray-400">暂无配件数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Detail Modal -->
    <div v-if="detail" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" @click.self="detail=null">
      <div class="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="flex items-center justify-between p-5 border-b">
          <h2 class="font-semibold text-gray-800">配件详情 — <span class="text-blue-600">{{ detail.name }}</span></h2>
          <button @click="detail=null" class="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div class="p-5">
          <div class="grid grid-cols-2 gap-3 mb-5">
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">型号</div><div class="text-sm font-mono">{{ detail.model || '-' }}</div></div>
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">类别</div><div class="text-sm">{{ detail.category }}</div></div>
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">当前库存</div><div class="text-sm"><span :class="detail.stock <= detail.minStock ? 'text-red-600 font-bold' : ''">{{ detail.stock }}</span> {{ detail.unit }}</div></div>
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">最低预警</div><div class="text-sm">{{ detail.minStock }} {{ detail.unit }}</div></div>
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">单价</div><div class="text-sm text-green-600 font-medium">¥{{ detail.price }}</div></div>
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">供应商</div><div class="text-sm">{{ detail.supplier || '-' }}</div></div>
            <div class="bg-gray-50 rounded-lg p-3 col-span-2"><div class="text-xs text-gray-400 mb-1">备注</div><div class="text-sm">{{ detail.note || '-' }}</div></div>
          </div>
          
          <!-- 使用记录 -->
          <div>
            <div class="text-xs font-medium text-gray-500 mb-2">使用记录</div>
            <div v-if="partUsageHistory.length > 0" class="space-y-2 max-h-48 overflow-y-auto">
              <div v-for="u in partUsageHistory" :key="u.id" class="flex items-center justify-between bg-gray-50 rounded-lg p-2 text-xs">
                <div>
                  <span class="font-medium">{{ u.qty }}{{ detail.unit }}</span>
                  <span class="text-gray-400 ml-2">→ {{ getDeviceName(u.device) }}</span>
                </div>
                <div class="text-gray-400">{{ u.date }}</div>
              </div>
            </div>
            <div v-else class="text-xs text-gray-400 bg-gray-50 rounded-lg p-3 text-center">暂无使用记录</div>
          </div>
          
          <div class="flex gap-3 mt-5">
            <button @click="showRestock(detail); detail=null" class="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">入库</button>
            <button @click="showForm(detail); detail=null" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">编辑</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Modal -->
    <div v-if="form" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" @click.self="form=null">
      <div class="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="flex items-center justify-between p-5 border-b">
          <h2 class="font-semibold text-gray-800">{{ isEdit ? '编辑' : '新增' }}配件</h2>
          <button @click="form=null" class="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div class="p-5 space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">配件名称 *</label>
              <input v-model="form.name" type="text" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">型号</label>
              <input v-model="form.model" type="text" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">类别 *</label>
              <select v-model="form.category" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option v-for="c in store.partCategories" :key="c">{{ c }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">单位</label>
              <input v-model="form.unit" type="text" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">库存数量</label>
              <input v-model.number="form.stock" type="number" min="0" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">最低库存预警</label>
              <input v-model.number="form.minStock" type="number" min="0" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">单价 (元)</label>
              <input v-model.number="form.price" type="number" min="0" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">供应商</label>
              <input v-model="form.supplier" type="text" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">备注</label>
            <input v-model="form.note" type="text" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div class="flex gap-3 pt-2">
            <button @click="form=null" class="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">取消</button>
            <button @click="saveForm" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">保存</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Restock Modal -->
    <div v-if="restockPart" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" @click.self="restockPart=null">
      <div class="bg-white rounded-xl w-full max-w-sm shadow-2xl">
        <div class="flex items-center justify-between p-5 border-b">
          <h2 class="font-semibold text-gray-800">配件入库</h2>
          <button @click="restockPart=null" class="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div class="p-5 space-y-4">
          <div class="bg-gray-50 rounded-lg p-3">
            <div class="text-sm font-medium">{{ restockPart.name }}</div>
            <div class="text-xs text-gray-400">当前库存: {{ restockPart.stock }} {{ restockPart.unit }}</div>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">入库数量 *</label>
            <input v-model.number="restockQty" type="number" min="1" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div class="flex gap-3">
            <button @click="restockPart=null" class="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">取消</button>
            <button @click="doRestock" class="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">确认入库</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Delete -->
    <div v-if="delTarget" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" @click.self="delTarget=null">
      <div class="bg-white rounded-xl p-6 max-w-sm w-full text-center shadow-2xl">
        <div class="text-4xl mb-3">🗑️</div>
        <p class="text-gray-700 mb-5">确定删除此配件吗？</p>
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
const fCat = ref('')
const fStock = ref('')
const form = ref(null)
const isEdit = ref(false)
const delTarget = ref(null)
const restockPart = ref(null)
const restockQty = ref(1)
const detail = ref(null)

const filtered = computed(() => {
  return store.parts.filter(p => {
    const matchKw = !kw.value || p.name.includes(kw.value) || p.model?.includes(kw.value)
    const matchCat = !fCat.value || p.category === fCat.value
    const matchStock = !fStock.value || (fStock.value === 'low' && p.stock <= p.minStock) || (fStock.value === 'ok' && p.stock > p.minStock)
    return matchKw && matchCat && matchStock
  })
})

const lowStockParts = computed(() => store.parts.filter(p => p.stock <= p.minStock))

const partUsageHistory = computed(() => {
  if (!detail.value) return []
  return store.partUsages.filter(u => u.part === detail.value.id)
})

function getDeviceName(id) { return store.getDeviceName(id) }

function showDetail(p) { detail.value = p }

function showForm(o) {
  if (o) {
    isEdit.value = true
    form.value = { ...o }
  } else {
    isEdit.value = false
    form.value = { name: '', model: '', category: '耗材', stock: 0, minStock: 1, unit: '个', price: 0, supplier: '', note: '' }
  }
}

function saveForm() {
  if (!form.value.name || !form.value.category) { showToast('请填写必填项', 'error'); return }
  if (isEdit.value) {
    store.updatePart(form.value.id, form.value)
    showToast('配件已更新')
  } else {
    store.addPart(form.value)
    showToast('配件已添加')
  }
  form.value = null
}

function showRestock(p) {
  restockPart.value = p
  restockQty.value = 1
}

function doRestock() {
  if (!restockQty.value || restockQty.value < 1) { showToast('请输入有效数量', 'error'); return }
  store.restockPart(restockPart.value.id, restockQty.value)
  showToast(`已入库 ${restockQty.value} ${restockPart.value.unit}`)
  restockPart.value = null
}

function confirmDel(p) { delTarget.value = p }
function doDelete() {
  store.deletePart(delTarget.value.id)
  showToast('已删除')
  delTarget.value = null
}
</script>
