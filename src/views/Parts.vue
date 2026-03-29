<template>
  <div class="space-y-4">
    <!-- 配件统计卡片 -->
    <div class="grid grid-cols-3 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-xl">🔩</div>
        <div>
          <div class="text-xl font-bold text-gray-800" style="font-family:monospace">{{ store.parts.length }}</div>
          <div class="text-xs text-gray-400">配件种类</div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 cursor-pointer hover:bg-gray-50" @click="fStock='low'; fCat=''; kw=''">
        <div class="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-xl">⚠️</div>
        <div>
          <div class="text-xl font-bold text-red-600" style="font-family:monospace">{{ lowStockParts.length }}</div>
          <div class="text-xs text-gray-400">库存不足</div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-xl">📦</div>
        <div>
          <div class="text-xl font-bold text-gray-800" style="font-family:monospace">{{ store.parts.reduce((s, p) => s + p.stock, 0) }}</div>
          <div class="text-xs text-gray-400">总库存量</div>
        </div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="flex gap-3 items-center flex-wrap">
      <input v-model="kw" type="text" placeholder="🔍 搜索配件名称/型号/品牌..." class="px-4 py-2 border border-gray-200 rounded-lg text-sm w-60 focus:outline-none focus:ring-2 focus:ring-blue-500">
      <select v-model="fCat" class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">全部分类</option>
        <option v-for="c in store.partCategories" :key="c">{{ c }}</option>
      </select>
      <select v-model="fStock" class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">全部库存</option>
        <option value="low">库存不足</option>
        <option value="ok">库存正常</option>
      </select>
      <div class="ml-auto">
        <button @click="showForm(null)" class="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2">+ 新增配件</button>
      </div>
    </div>

    <!-- 库存预警条 -->
    <div v-if="lowStockParts.length > 0" class="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
      <span class="text-red-500 mt-0.5">⚠️</span>
      <div>
        <span class="text-sm text-red-700 font-medium">以下配件库存不足，请及时补货</span>
        <div class="flex flex-wrap gap-1 mt-1">
          <span v-for="p in lowStockParts" :key="p.id" class="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">{{ p.name }} ({{ p.stock }}/{{ p.minStock }})</span>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-xs text-gray-400 uppercase border-b bg-gray-50/50">
            <th class="px-4 py-3 font-medium">配件名称</th>
            <th class="px-4 py-3 font-medium">型号/规格</th>
            <th class="px-4 py-3 font-medium">分类</th>
            <th class="px-4 py-3 font-medium">单位</th>
            <th class="px-4 py-3 font-medium">库存</th>
            <th class="px-4 py-3 font-medium">单价</th>
            <th class="px-4 py-3 font-medium">供应商</th>
            <th class="px-4 py-3 font-medium">操作</th>
          </tr>
        </thead>
        <tbody class="text-gray-700">
          <tr v-for="p in filtered" :key="p.id" class="border-b border-gray-50 hover:bg-blue-50/30 transition cursor-pointer" @click="showDetail(p)">
            <td class="px-4 py-3 font-medium">{{ p.name }}</td>
            <td class="px-4 py-3 text-xs text-gray-500">{{ p.model || '-' }}</td>
            <td class="px-4 py-3"><span class="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{{ p.category }}</span></td>
            <td class="px-4 py-3">{{ p.unit }}</td>
            <td class="px-4 py-3">
              <span :class="['font-medium', p.stock <= p.minStock ? 'text-red-600' : 'text-green-600']">{{ p.stock }}</span>
              <span class="text-xs text-gray-400"> / 最低 {{ p.minStock }}</span>
            </td>
            <td class="px-4 py-3 text-orange-600">¥{{ p.price }}</td>
            <td class="px-4 py-3 text-xs text-gray-400">{{ p.supplier || '-' }}</td>
            <td class="px-4 py-3" @click.stop>
              <button @click="showRestock(p)" class="text-green-500 hover:text-green-700 text-xs mr-2">入库</button>
              <button @click="showForm(p)" class="text-blue-500 hover:text-blue-700 text-xs mr-2">编辑</button>
              <button @click="confirmDel(p)" class="text-red-400 hover:text-red-600 text-xs">删除</button>
            </td>
          </tr>
          <tr v-if="filtered.length === 0">
            <td colspan="8" class="text-center py-12 text-gray-400"><div class="text-4xl mb-2">🔩</div>暂无配件数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 详情 Modal -->
    <div v-if="detail" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" @click.self="detail=null">
      <div class="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="flex items-center justify-between p-5 border-b">
          <h2 class="font-semibold text-gray-800">{{ detail.name }}</h2>
          <button @click="detail=null" class="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div class="p-5">
          <div class="grid grid-cols-2 gap-3 mb-5">
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">型号/规格</div><div class="text-sm">{{ detail.model || '-' }}</div></div>
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">分类</div><div class="text-sm">{{ detail.category }}</div></div>
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">单位</div><div class="text-sm">{{ detail.unit }}</div></div>
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">单价</div><div class="text-sm text-orange-600 font-medium">¥{{ detail.price }}</div></div>
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">库存</div><div class="text-sm"><span :class="detail.stock <= detail.minStock ? 'text-red-600 font-bold' : 'text-green-600'">{{ detail.stock }}</span> / 最低 {{ detail.minStock }}</div></div>
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">供应商</div><div class="text-sm">{{ detail.supplier || '-' }}</div></div>
            <div class="bg-gray-50 rounded-lg p-3 col-span-2"><div class="text-xs text-gray-400 mb-1">备注</div><div class="text-sm">{{ detail.note || '-' }}</div></div>
          </div>
          <!-- 使用记录 -->
          <div>
            <div class="text-xs font-medium text-gray-500 mb-3">使用记录</div>
            <div class="space-y-2">
              <div v-for="u in partUsageHistory" :key="u.id" class="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg text-sm">
                <div>
                  <span class="font-mono text-xs text-blue-500 mr-2">{{ u.order }}</span>
                  <span class="text-gray-500">{{ u.date }}</span>
                  <span class="ml-2 text-gray-400">×{{ u.qty }}</span>
                </div>
                <span class="text-orange-600 font-medium">¥{{ u.price }}</span>
              </div>
              <div v-if="partUsageHistory.length === 0" class="text-center py-4 text-gray-400 text-xs">暂无使用记录</div>
            </div>
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
      <div class="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="flex items-center justify-between p-5 border-b">
          <h2 class="font-semibold text-gray-800">{{ isEdit ? '编辑' : '新增' }}配件</h2>
          <button @click="form=null" class="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div class="p-5 space-y-4">
          <!-- 第一行：配件名称（核心输入） -->
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">配件名称 *</label>
            <div class="relative">
              <input v-model="form.name" type="text" placeholder="输入配件名称，如：碳粉、硒鼓、定影膜"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="nameCategoryError ? 'border-red-400 ring-1 ring-red-300' : ''"
                @input="onNameInput" @focus="onNameFocus" autocomplete="off">
              <!-- 名称冲突警告 -->
              <div v-if="nameCategoryError" class="mt-1.5 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                ⚠️ 「{{ form.name }}」已存在于「{{ nameCategoryError }}」，不能添加到「{{ form.category }}」
              </div>
              <!-- 已有配件建议（输入时显示同类别的名称） -->
              <div v-if="showNameList && nameCandidates.length > 0"
                class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-20 max-h-52 overflow-y-auto">
                <div class="px-3 py-1.5 text-xs text-gray-400 border-b bg-gray-50">现有配件（点击自动填入）</div>
                <div v-for="p in nameCandidates" :key="p.id" class="px-4 py-2.5 cursor-pointer hover:bg-blue-50 border-b border-gray-50 last:border-b-0"
                  @mousedown.prevent="selectExistingPart(p)">
                  <div class="text-sm font-medium text-gray-800">{{ p.name }}</div>
                  <div class="text-xs text-gray-400 mt-0.5">
                    {{ p.category }} · {{ p.model || '无型号' }} · 库存 {{ p.stock }} · ¥{{ p.price }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- 第二行：分类 + 型号 -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">分类 *</label>
              <select v-model="form.category" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option v-for="c in store.partCategories" :key="c">{{ c }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">型号/规格</label>
              <input v-model="form.model" type="text" placeholder="如：TNR-C4BK" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
          </div>
          <!-- 第三行：单位 + 单价 -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">单位 *</label>
              <select v-model="form.unit" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>支</option>
                <option>个</option>
                <option>套</option>
                <option>张</option>
                <option>米</option>
                <option>卷</option>
                <option>盒</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">单价 (元) *</label>
              <input v-model.number="form.price" type="number" min="0" placeholder="0" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
          </div>
          <!-- 第四行：库存 + 最低库存 -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">当前库存</label>
              <input v-model.number="form.stock" type="number" min="0" placeholder="0" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">最低库存预警</label>
              <input v-model.number="form.minStock" type="number" min="0" placeholder="1" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
          </div>
          <!-- 第五行：供应商 -->
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">供应商</label>
            <input v-model="form.supplier" type="text" placeholder="输入供应商名称" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <!-- 第六行：备注 -->
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">备注</label>
            <input v-model="form.note" type="text" placeholder="可选备注，如适用机型等" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <!-- 按钮 -->
          <div class="flex gap-3 pt-2">
            <button @click="form=null" class="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">取消</button>
            <button @click="saveForm" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">保存</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 入库 Modal -->
    <div v-if="restockPart" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl w-full max-w-sm shadow-2xl">
        <div class="flex items-center justify-between p-5 border-b">
          <h2 class="font-semibold text-gray-800">配件入库</h2>
          <button @click="restockPart=null" class="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div class="p-5 space-y-4">
          <div class="bg-gray-50 rounded-lg p-3">
            <div class="text-sm font-medium">{{ restockPart.name }}</div>
            <div class="text-xs text-gray-400">{{ restockPart.model || '无型号' }} · 当前库存 {{ restockPart.stock }}</div>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">入库数量</label>
            <input v-model.number="restockQty" type="number" min="1" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div class="flex gap-3">
            <button @click="restockPart=null" class="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">取消</button>
            <button @click="doRestock" class="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">确认入库</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除确认 -->
    <div v-if="delTarget" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl p-6 max-w-sm w-full text-center shadow-2xl">
        <div class="text-4xl mb-3">🗑️</div>
        <p class="text-gray-700 mb-5">确定删除配件 <b>{{ delTarget.name }}</b> 吗？</p>
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
const detail = ref(null)
const isEdit = ref(false)
const delTarget = ref(null)
const restockPart = ref(null)
const restockQty = ref(1)
const showNameList = ref(false)

// 输入名称时：显示同类别的已有配件供选择
const nameCandidates = computed(() => {
  const q = (form.value?.name || '').trim().toLowerCase()
  const cat = form.value?.category || ''
  let list = store.parts
  // 分类过滤
  if (cat) list = list.filter(p => p.category === cat)
  // 搜索过滤
  if (q) list = list.filter(p => (p.name || '').toLowerCase().includes(q) || (p.model || '').toLowerCase().includes(q))
  return list.slice(0, 8)
})

// 名称与类别冲突检测
const nameCategoryError = computed(() => {
  const q = (form.value?.name || '').trim()
  if (!q) return null
  const conflict = store.parts.find(p => {
    if (isEdit.value && p.id === form.value.id) return false
    return (p.name || '').toLowerCase() === q.toLowerCase() && (p.category || '') !== (form.value?.category || '')
  })
  return conflict ? conflict.category : null
})

function onNameInput() { showNameList.value = true }
function onNameFocus() { showNameList.value = true }

// 选择已有配件，自动填入所有字段
function selectExistingPart(p) {
  if (!form.value) return
  form.value.name = p.name
  form.value.model = p.model || ''
  form.value.category = p.category
  form.value.unit = p.unit || '个'
  form.value.price = p.price || 0
  form.value.supplier = p.supplier || ''
  form.value.minStock = p.minStock || 1
  showNameList.value = false
}

function hideNameList() { setTimeout(() => { showNameList.value = false }, 200) }

const filtered = computed(() => {
  return store.parts.filter(p => {
    const matchKw = !kw.value || (p.name + (p.model || '') + (p.supplier || '')).toLowerCase().includes(kw.value.toLowerCase())
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

function showDetail(p) { detail.value = p }

function showForm(o) {
  showNameList.value = false
  if (o) {
    isEdit.value = true
    form.value = { ...o }
  } else {
    isEdit.value = false
    form.value = { name: '', model: '', category: '耗材', unit: '支', stock: 0, minStock: 2, price: 0, supplier: '', note: '' }
  }
}

function saveForm() {
  if (!form.value.name || !form.value.category || !form.value.unit) {
    showToast('请填写必填项', 'error'); return
  }
  // 名称与类别冲突检测
  if (nameCategoryError.value) {
    showToast(`配件「${form.value.name}」已存在于「${nameCategoryError.value}」，类别不匹配`, 'error')
    return
  }
  // 完全重复检测（编辑时排除自身）
  const dup = store.parts.find(p => {
    if (isEdit.value && p.id === form.value.id) return false
    return (
      (p.name || '').toLowerCase() === (form.value.name || '').toLowerCase() &&
      (p.category || '').toLowerCase() === (form.value.category || '').toLowerCase() &&
      (p.model || '').toLowerCase() === (form.value.model || '').toLowerCase() &&
      (p.supplier || '').toLowerCase() === (form.value.supplier || '').toLowerCase()
    )
  })
  if (dup) {
    showToast(`配件「${form.value.name}（${form.value.model}）」已存在，请勿重复添加`, 'error')
    return
  }
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
  showToast(`入库成功：+${restockQty.value}，${restockPart.value.name} 现有库存 ${restockPart.value.stock + restockQty.value}`)
  restockPart.value = null
}

function confirmDel(p) { delTarget.value = p }
function doDelete() {
  store.deletePart(delTarget.value.id)
  showToast('配件已删除')
  delTarget.value = null
}
</script>
