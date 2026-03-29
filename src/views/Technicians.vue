<template>
  <div class="space-y-4">
    <div class="flex gap-3 items-center flex-wrap">
      <input v-model="kw" type="text" placeholder="🔍 搜索姓名/账号..." class="px-4 py-2 border border-gray-200 rounded-lg text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-500">
      <select v-model="fRole" class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">全部</option>
        <option>管理员</option>
        <option>技术员</option>
        <option>客服</option>
        <option>在职</option>
        <option>禁用</option>
      </select>
      <div class="ml-auto">
        <button @click="showForm(null)" class="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2">
          + 新建账号
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-6 gap-3">
      <div class="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 cursor-pointer hover:shadow-md transition" @click="fRole='管理员'; kw=''">
        <div class="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0">👨‍💼</div>
        <div><div class="text-lg font-bold text-gray-800">{{ adminCount }}</div><div class="text-xs text-gray-400">管理员</div></div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 cursor-pointer hover:shadow-md transition" @click="fRole='技术员'; kw=''">
        <div class="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0">🔧</div>
        <div><div class="text-lg font-bold text-gray-800">{{ techCount }}</div><div class="text-xs text-gray-400">在职技术员</div></div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 cursor-pointer hover:shadow-md transition" @click="fRole='客服'; kw=''">
        <div class="w-9 h-9 bg-pink-50 rounded-lg flex items-center justify-center text-lg flex-shrink-0">👩‍💻</div>
        <div><div class="text-lg font-bold text-gray-800">{{ serviceCount }}</div><div class="text-xs text-gray-400">在职客服</div></div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 cursor-pointer hover:shadow-md transition" @click="fRole='在职'; kw=''">
        <div class="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0">✅</div>
        <div><div class="text-lg font-bold text-gray-800">{{ activeCount }}</div><div class="text-xs text-gray-400">在职账号</div></div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 cursor-pointer hover:shadow-md transition" @click="kw=''; fRole=''">
        <div class="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0">📋</div>
        <div><div class="text-lg font-bold text-gray-800">{{ store.users.length }}</div><div class="text-xs text-gray-400">全部账号</div></div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 cursor-pointer hover:shadow-md transition" @click="fRole='禁用'; kw=''">
        <div class="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center text-lg flex-shrink-0">🚫</div>
        <div><div class="text-lg font-bold text-gray-800">{{ inactiveCount }}</div><div class="text-xs text-gray-400">禁用账号</div></div>
      </div>
    </div>

    <!-- 已停用账号提示 -->
    <div v-if="inactiveCount > 0" class="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-center gap-3">
      <span class="text-xl">⚠️</span>
      <div class="flex-1 text-sm text-orange-700">
        有 <b>{{ inactiveCount }}</b> 个已停用账号，
        <span v-if="fRole==='禁用'">当前显示已停用账号</span>
        <span v-else>点击 <b>"全部账号"</b> 可查看</span>
      </div>
      <button v-if="fRole!=='禁用'" @click="fRole='禁用'; kw=''" class="text-xs text-orange-600 hover:text-orange-800 underline">查看已停用</button>
      <button v-else @click="fRole=''; kw=''" class="text-xs text-orange-600 hover:text-orange-800 underline">返回全部</button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl shadow-sm">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-xs text-gray-400 uppercase border-b bg-gray-50/50">
            <th class="px-4 py-3 font-medium">账号信息</th>
            <th class="px-4 py-3 font-medium">姓名</th>
            <th class="px-4 py-3 font-medium">角色</th>
            <th class="px-4 py-3 font-medium">联系电话</th>
            <th class="px-4 py-3 font-medium">邮箱</th>
            <th class="px-4 py-3 font-medium">状态</th>
            <th class="px-4 py-3 font-medium">操作</th>
          </tr>
        </thead>
        <tbody class="text-gray-700">
          <tr v-for="u in filtered" :key="u.id" class="border-b border-gray-50 hover:bg-blue-50/30 transition cursor-pointer"
            @click="showDetail(u)">
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{{ u.avatar }}</div>
                <div>
                  <div class="font-medium text-xs font-mono text-gray-700">{{ u.username }}</div>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 font-medium">{{ u.name }}</td>
            <td class="px-4 py-3">
              <span :class="['inline-block px-2 py-0.5 rounded-full text-xs font-medium', u.role === '管理员' ? 'bg-purple-100 text-purple-700' : u.role === '客服' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700']">
                {{ u.role }}
              </span>
            </td>
            <td class="px-4 py-3 text-xs">{{ u.phone }}</td>
            <td class="px-4 py-3 text-xs text-gray-400">{{ u.email }}</td>
            <td class="px-4 py-3">
              <span :class="['inline-block px-2 py-0.5 rounded-full text-xs font-medium', u.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500']">
                {{ u.active ? '在职' : '已禁用' }}
              </span>
            </td>
            <td class="px-4 py-3" @click.stop>
              <button v-if="store.isAdmin" @click="showForm(u)" class="text-blue-500 hover:text-blue-700 text-xs mr-2">编辑</button>
              <button v-if="u.role !== '管理员'" @click="toggleActive(u)" :class="['text-xs mr-2', u.active ? 'text-orange-500 hover:text-orange-700' : 'text-green-500 hover:text-green-700']">
                {{ u.active ? '禁用' : '启用' }}
              </button>
              <button v-if="store.isAdmin && store.currentUserId !== u.id" @click="confirmDel(u)" class="text-red-400 hover:text-red-600 text-xs">删除</button>
            </td>
          </tr>
          <tr v-if="filtered.length === 0">
            <td colspan="7" class="text-center py-12 text-gray-400">
              <div class="text-4xl mb-2">🔧</div>暂无账号
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Detail Modal -->
    <div v-if="detail" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" @click.self="detail=null">
      <div class="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="flex items-center justify-between p-5 border-b">
          <h2 class="font-semibold text-gray-800">账号详情</h2>
          <button @click="detail=null" class="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div class="p-5">
          <div class="flex items-center gap-4 mb-5">
            <div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">{{ detail.avatar }}</div>
            <div>
              <div class="text-lg font-bold text-gray-800">{{ detail.name }}</div>
              <div class="text-sm text-gray-400 font-mono">@{{ detail.username }}</div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3 mb-5">
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">角色</div><span :class="['inline-block px-2 py-0.5 rounded-full text-xs font-medium', detail.role === '管理员' ? 'bg-purple-100 text-purple-700' : detail.role === '客服' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700']">{{ detail.role }}</span></div>
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">状态</div><span :class="['inline-block px-2 py-0.5 rounded-full text-xs font-medium', detail.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500']">{{ detail.active ? '在职' : '已禁用' }}</span></div>
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">联系电话</div><div class="text-sm">{{ detail.phone || '-' }}</div></div>
            <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">邮箱</div><div class="text-sm truncate">{{ detail.email || '-' }}</div></div>
          </div>
          
          <!-- 工作统计 -->
          <div class="bg-blue-50 rounded-lg p-4 mb-5">
            <div class="text-xs font-medium text-blue-600 mb-2">工作统计</div>
            <div class="grid grid-cols-2 gap-4 text-center">
              <div><div class="text-2xl font-bold text-blue-700">{{ userOrdersCount }}</div><div class="text-xs text-blue-500">处理工单</div></div>
              <div><div class="text-2xl font-bold text-blue-700">{{ userInspectionsCount }}</div><div class="text-xs text-blue-500">巡检任务</div></div>
            </div>
          </div>
          
          <div class="flex gap-3">
            <button @click="showForm(detail); detail=null" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">编辑</button>
            <button v-if="detail.role !== '管理员'" @click="toggleActive(detail); detail=null" :class="['flex-1 px-4 py-2 rounded-lg text-sm font-medium', detail.active ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-green-500 text-white hover:bg-green-600']">{{ detail.active ? '禁用' : '启用' }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Modal -->
    <div v-if="form" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" @click.self="form=null">
      <div class="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="flex items-center justify-between p-5 border-b">
          <h2 class="font-semibold text-gray-800">{{ isEdit ? '编辑' : '新建' }}账号</h2>
          <button @click="form=null" class="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div class="p-5 space-y-4">
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">登录账号 * <span class="text-gray-300 font-normal">(英文/数字)</span></label>
            <input v-model="form.username" type="text" :placeholder="isEdit ? '(不修改请留空)' : '必填'" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">{{ isEdit ? '新密码 (留空不修改)' : '登录密码 *' }}</label>
            <input v-model="form.password" type="text" :placeholder="isEdit ? '留空则保持原密码' : '必填'" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">姓名 *</label>
              <input v-model="form.name" type="text" placeholder="如：张师傅" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">角色 *</label>
              <select v-model="form.role" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>技术员</option><option>客服</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">头像文字 * <span class="text-gray-300 font-normal">(1个字符)</span></label>
            <input v-model="form.avatar" maxlength="1" class="w-16 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">联系电话</label>
              <input v-model="form.phone" type="text" placeholder="手机号" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">邮箱</label>
              <input v-model="form.email" type="text" placeholder="邮箱" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
          </div>
          <div class="flex gap-3 pt-2">
            <button @click="form=null" class="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">取消</button>
            <button @click="saveForm" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">{{ isEdit ? '保存修改' : '创建账号' }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Delete -->
    <div v-if="delTarget" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" @click.self="delTarget=null">
      <div class="bg-white rounded-xl p-6 max-w-sm w-full text-center shadow-2xl">
        <div class="text-4xl mb-3">🗑️</div>
        <p class="text-gray-700 mb-1">确定禁用账号 <b>{{ delTarget.name }}</b> 吗？</p>
        <p class="text-gray-400 text-xs mb-5">禁用后该账号将无法登录，可随时重新启用。</p>
        <div class="flex gap-3">
          <button @click="delTarget=null" class="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">取消</button>
          <button @click="doDelete" class="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600">确认禁用</button>
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
const fRole = ref('')
const form = ref(null)
const isEdit = ref(false)
const delTarget = ref(null)
const detail = ref(null)

const filtered = computed(() => {
  return store.users.filter(u => {
    const matchKw = !kw.value || u.name.includes(kw.value) || u.username.includes(kw.value) || u.phone?.includes(kw.value)
    const matchRole = !fRole.value || fRole.value === '全部'
      ? true
      : fRole.value === '禁用'
        ? !u.active
        : u.active && (fRole.value === '在职' || u.role === fRole.value)
    return matchKw && matchRole
  })
})

const techCount = computed(() => store.users.filter(u => u.role === '技术员' && u.active).length)
const adminCount = computed(() => store.users.filter(u => u.role === '管理员' && u.active).length)
const serviceCount = computed(() => store.users.filter(u => u.role === '客服' && u.active).length)
const activeCount = computed(() => store.users.filter(u => u.active).length)
const inactiveCount = computed(() => store.users.filter(u => !u.active).length)

const userOrdersCount = computed(() => {
  if (!detail.value) return 0
  return store.orders.filter(o => o.assignee === detail.value.name).length
})

const userInspectionsCount = computed(() => {
  if (!detail.value) return 0
  return store.inspections.filter(i => i.assignee === detail.value.name).length
})

function showDetail(u) { detail.value = u }

function showForm(u) {
  if (u) {
    isEdit.value = true
    form.value = { ...u, password: '' }
  } else {
    isEdit.value = false
    form.value = { username: '', password: '', name: '', role: '技术员', phone: '', email: '', avatar: '' }
  }
}

function saveForm() {
  if (!form.value.name) { showToast('请填写姓名', 'error'); return }
  if (!isEdit.value) {
    if (form.value.role === '管理员') { showToast('无权创建管理员账号', 'error'); return }
    if (!form.value.username || !form.value.password) { showToast('账号和密码不能为空', 'error'); return }
    if (store.users.find(u => u.username === form.value.username)) { showToast('账号已存在', 'error'); return }
    if (!form.value.avatar) form.value.avatar = form.value.name.slice(0, 1)
    store.addUser(form.value)
    showToast('账号已创建')
  } else {
    const data = { name: form.value.name, role: form.value.role, phone: form.value.phone, email: form.value.email, avatar: form.value.avatar || form.value.name.slice(0,1) }
    if (form.value.password) data.password = form.value.password
    if (form.value.username && form.value.password) {
      // also update username
      const idx = store.users.findIndex(u => u.id === form.value.id)
      if (idx > -1) store.users[idx] = { ...store.users[idx], ...data, username: form.value.username, password: form.value.password }
    } else {
      store.updateUser(form.value.id, data)
    }
    showToast('账号已更新')
  }
  form.value = null
}

function toggleActive(u) {
  if (u.role === '管理员') { showToast('不允许禁用管理员账号', 'error'); return }
  store.updateUser(u.id, { active: !u.active })
  showToast(u.active ? `已禁用 ${u.name}` : `已启用 ${u.name}`)
}

function confirmDel(u) { delTarget.value = u }
function doDelete() {
  store.deleteUser(delTarget.value.id)
  showToast(`账号已禁用`)
  delTarget.value = null
}
</script>
