import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // User
  const user = ref({ name: '管理员', role: '管理员', phone: '13800138000', email: 'admin@copier.cn', avatar: '管' })
  const isLoggedIn = ref(false)
  const currentUserId = ref('')

  // 权限
  const isAdmin = computed(() => user.value.role === '管理员')
  const isTech = computed(() => user.value.role === '技术员')
  const isService = computed(() => user.value.role === '客服')

  // 用户账号列表（密码存储在本地，仅示例用途）
  const users = ref([
    { id: 'u1', username: 'admin', password: 'admin', name: '管理员', role: '管理员', phone: '13800138000', email: 'admin@copier.cn', avatar: '管', active: true },
    { id: 'u2', username: 'repair', password: 'repair', name: '李师傅', role: '技术员', phone: '13900001111', email: 'lisf@copier.cn', avatar: '李', active: true },
    { id: 'u3', username: 'zhang', password: 'zhang123', name: '张师傅', role: '技术员', phone: '13700002222', email: 'zhangsf@copier.cn', avatar: '张', active: true },
    { id: 'u4', username: 'wang', password: 'wang123', name: '王师傅', role: '技术员', phone: '13600003333', email: 'wangs@copier.cn', avatar: '王', active: true },
    { id: 'u5', username: 'kefu', password: 'kefu123', name: '小美', role: '客服', phone: '13500006666', email: 'xiaomei@copier.cn', avatar: '美', active: true },
  ])

  function verifyLogin(username, password) {
    const u = users.value.find(x => x.username === username && x.password === password && x.active)
    return u || null
  }

  function getUserById(id) { return users.value.find(x => x.id === id) }

  // Data
  const customers = ref([
    { id: 'c1', name: '深圳华强电子', contact: '李总', phone: '13800001111', addr: '福田区深南大道100号', note: '长期VIP' },
    { id: 'c2', name: '广州智谷科技', contact: '王经理', phone: '13900002222', addr: '天河区珠江新城A座', note: '月结客户' },
    { id: 'c3', name: '东莞鑫源印刷', contact: '张小姐', phone: '13700003333', addr: '东莞南城区鸿福路88号', note: '紧急响应' },
    { id: 'c4', name: '佛山南海印刷厂', contact: '陈厂长', phone: '13600004444', addr: '佛山南海区狮山镇', note: '批量设备' },
    { id: 'c5', name: '惠州金蝶软件', contact: '刘主任', phone: '13500005555', addr: '惠州惠城区江北CBD', note: 'IT部门' },
  ])

  const devices = ref([
    { id: 'd1', model: '柯美 Bizhub 658e', sn: 'KM202403001', customer: 'c1', addr: '福田区深南大道100号3楼', status: '正常', date: '2024-03-15' },
    { id: 'd2', model: '富士施乐 Versant 280', sn: 'FX202403002', customer: 'c1', addr: '福田区深南大道100号5楼', status: '正常', date: '2024-03-20' },
    { id: 'd3', model: '理光 MP C6503', sn: 'RC202404003', customer: 'c2', addr: '天河区珠江新城A座12层', status: '故障', date: '2024-04-10' },
    { id: 'd4', model: '佳能 imageRUNNER 2206', sn: 'CN202404004', customer: 'c2', addr: '天河区珠江新城B座8层', status: '正常', date: '2024-04-15' },
    { id: 'd5', model: '柯美 Bizhub 458e', sn: 'KM202405005', customer: 'c3', addr: '东莞南城区鸿福路88号', status: '维修中', date: '2024-05-01' },
    { id: 'd6', model: '富士施乐 ApeosPort-VII', sn: 'FX202405006', customer: 'c3', addr: '东莞南城区鸿福路88号2楼', status: '正常', date: '2024-05-10' },
    { id: 'd7', model: '理光 IM C6000', sn: 'RC202406007', customer: 'c4', addr: '佛山南海区狮山镇工业区', status: '正常', date: '2024-06-05' },
    { id: 'd8', model: '柯美 Bizhub 368e', sn: 'KM202406008', customer: 'c4', addr: '佛山南海区狮山镇办公区', status: '故障', date: '2024-06-12' },
    { id: 'd9', model: '佳能 imageRUNNER ADV', sn: 'CN202406009', customer: 'c5', addr: '惠州惠城区江北CBD', status: '正常', date: '2024-06-20' },
    { id: 'd10', model: '东芝 e-STUDIO 4528A', sn: 'TS202406010', customer: 'c5', addr: '惠州惠城区江北CBD 15层', status: '正常', date: '2024-06-25' },
  ])

  const orders = ref([
    { id: 'W202603001', title: '柯美658e卡纸频繁', customer: 'c1', device: 'd1', priority: '紧急', status: '待处理', assignee: '', created: '2026-03-01', desc: '每打印50张即卡纸', logs: [{ t: '2026-03-01 09:00', n: '系统', m: '创建工单' }] },
    { id: 'W202603002', title: '施乐280进纸异常', customer: 'c1', device: 'd2', priority: '高', status: '处理中', assignee: '李师傅', created: '2026-03-02', desc: '进纸器报错E-01', logs: [{ t: '2026-03-02 10:00', n: '李师傅', m: '接单处理中' }] },
    { id: 'W202603003', title: '理光C6503无法开机', customer: 'c2', device: 'd3', priority: '紧急', status: '待处理', assignee: '', created: '2026-03-03', desc: '设备无法开机', logs: [{ t: '2026-03-03 08:30', n: '系统', m: '创建工单' }] },
    { id: 'W202603004', title: '佳能2206颜色偏淡', customer: 'c2', device: 'd4', priority: '普通', status: '待验收', assignee: '王师傅', created: '2026-03-04', desc: '碳粉不足', logs: [{ t: '2026-03-04 14:00', n: '王师傅', m: '维修完成' }] },
    { id: 'W202603005', title: '柯美458e换粉盒', customer: 'c3', device: 'd5', priority: '高', status: '维修中', assignee: '张师傅', created: '2026-03-05', desc: '碳粉用尽', logs: [{ t: '2026-03-05 09:00', n: '张师傅', m: '维修中' }] },
    { id: 'W202603006', title: '施乐ApeosPort报错E-05', customer: 'c3', device: 'd6', priority: '普通', status: '已完成', assignee: '李师傅', created: '2026-03-06', desc: '更换定影组件', logs: [{ t: '2026-03-06 11:00', n: '李师傅', m: '完成' }] },
    { id: 'W202603007', title: '理光IM C6000定期保养', customer: 'c4', device: 'd7', priority: '低', status: '待处理', assignee: '', created: '2026-03-10', desc: '季度保养', logs: [{ t: '2026-03-10 08:00', n: '系统', m: '创建工单' }] },
    { id: 'W202603008', title: '柯美368e主板故障', customer: 'c4', device: 'd8', priority: '紧急', status: '处理中', assignee: '王师傅', created: '2026-03-12', desc: '主板损坏', logs: [{ t: '2026-03-12 10:00', n: '王师傅', m: '配件已订购' }] },
    { id: 'W202603009', title: '佳能ADV网络扫描异常', customer: 'c5', device: 'd9', priority: '高', status: '待验收', assignee: '张师傅', created: '2026-03-15', desc: '网络扫描故障', logs: [{ t: '2026-03-15 14:30', n: '张师傅', m: '完成' }] },
    { id: 'W202603010', title: '东芝4528A驱动安装', customer: 'c5', device: 'd10', priority: '普通', status: '已完成', assignee: '李师傅', created: '2026-03-18', desc: '安装驱动', logs: [{ t: '2026-03-18 15:00', n: '李师傅', m: '完成' }] },
    { id: 'W202603011', title: '柯美658e双面卡纸', customer: 'c1', device: 'd1', priority: '高', status: '待处理', assignee: '', created: '2026-03-20', desc: '双面打印卡纸', logs: [{ t: '2026-03-20 09:00', n: '系统', m: '创建工单' }] },
    { id: 'W202603012', title: '施乐280定期巡检', customer: 'c1', device: 'd2', priority: '低', status: '已完成', assignee: '王师傅', created: '2026-03-22', desc: '月度巡检', logs: [{ t: '2026-03-22 10:00', n: '王师傅', m: '完成' }] },
    { id: 'W202603013', title: '理光C6503换粉保养', customer: 'c2', device: 'd3', priority: '普通', status: '已完成', assignee: '张师傅', created: '2026-03-23', desc: '更换碳粉', logs: [{ t: '2026-03-23 11:00', n: '张师傅', m: '完成' }] },
    { id: 'W202603014', title: '佳能2206卡纸维修', customer: 'c2', device: 'd4', priority: '高', status: '已完成', assignee: '李师傅', created: '2026-03-25', desc: '更换搓纸轮', logs: [{ t: '2026-03-25 14:00', n: '李师傅', m: '完成' }] },
    { id: 'W202603015', title: '施乐ApeosPort固件升级', customer: 'c3', device: 'd6', priority: '低', status: '待处理', assignee: '', created: '2026-03-26', desc: '固件升级', logs: [{ t: '2026-03-26 08:00', n: '系统', m: '创建工单' }] },
  ])

  const inspections = ref([
    { id: 'I001', device: 'd1', customer: 'c1', cycle: '每月', assignee: '张师傅', nextDate: '2026-04-15', lastDate: '2026-03-15', status: '已完成', result: '设备正常' },
    { id: 'I002', device: 'd2', customer: 'c1', cycle: '每月', assignee: '李师傅', nextDate: '2026-04-20', lastDate: '2026-03-20', status: '已完成', result: '已清洁保养' },
    { id: 'I003', device: 'd3', customer: 'c2', cycle: '每周', assignee: '王师傅', nextDate: '2026-04-07', lastDate: '2026-03-31', status: '待巡检', result: '' },
    { id: 'I004', device: 'd5', customer: 'c3', cycle: '每周', assignee: '张师傅', nextDate: '2026-04-03', lastDate: '2026-03-27', status: '待巡检', result: '' },
    { id: 'I005', device: 'd7', customer: 'c4', cycle: '每月', assignee: '李师傅', nextDate: '2026-04-05', lastDate: '2026-03-05', status: '已完成', result: '光栅润滑' },
  ])

  // 配件库存
  const parts = ref([
    { id: 'p1', name: '柯美定影组件', model: 'IU-610', category: '定影单元', stock: 5, minStock: 2, unit: '个', price: 1200, supplier: '广州耗材总汇', note: '适用于658e/458e系列' },
    { id: 'p2', name: '富士施乐搓纸轮', model: 'FU-280A', category: '进纸组件', stock: 12, minStock: 5, unit: '个', price: 85, supplier: '深圳办公设备', note: 'Versant系列通用' },
    { id: 'p3', name: '理光碳粉盒(黑)', model: 'TNR-C4BK', category: '耗材', stock: 28, minStock: 10, unit: '支', price: 320, supplier: '广州耗材总汇', note: 'MP C6503专用' },
    { id: 'p4', name: '佳能感光鼓组件', model: 'C-DRM1', category: '成像单元', stock: 3, minStock: 2, unit: '个', price: 680, supplier: '东莞数码配件', note: 'imageRUNNER系列' },
    { id: 'p5', name: '柯美主板组件', model: 'MIB-368', category: '电路板', stock: 1, minStock: 1, unit: '块', price: 2500, supplier: '广州耗材总汇', note: '368e专用' },
    { id: 'p6', name: '东芝定影膜', model: 'TS-FILM45', category: '定影单元', stock: 6, minStock: 3, unit: '个', price: 450, supplier: '佛山配件中心', note: 'e-STUDIO系列' },
    { id: 'p7', name: '施乐转印带', model: 'XF-BELT1', category: '成像单元', stock: 4, minStock: 2, unit: '个', price: 380, supplier: '深圳办公设备', note: 'ApeosPort-VII系列' },
    { id: 'p8', name: '理光废粉盒', model: 'TNR-WB1', category: '耗材', stock: 15, minStock: 5, unit: '个', price: 45, supplier: '广州耗材总汇', note: '通用型' },
  ])

  // 配件类别列表
  const partCategories = ['耗材', '定影单元', '进纸组件', '成像单元', '电路板', '其他']

  // 配件使用记录（工单关联）
  const partUsages = ref([
    { id: 'pu1', part: 'p3', partName: '理光碳粉盒(黑)', order: 'W202603013', device: 'd3', qty: 1, price: 320, user: '张师傅', date: '2026-03-23', note: '更换碳粉' },
    { id: 'pu2', part: 'p2', partName: '富士施乐搓纸轮', order: 'W202603014', device: 'd4', qty: 2, price: 170, user: '李师傅', date: '2026-03-25', note: '更换搓纸轮' },
    { id: 'pu3', part: 'p1', partName: '柯美定影组件', order: 'W202603006', device: 'd6', qty: 1, price: 1200, user: '李师傅', date: '2026-03-06', note: '更换定影组件' },
  ])

  let partUsageIdCtr = 4

  // 合同管理
  const contracts = ref([
    { id: 'CT001', customer: 'c1', title: '深圳华强电子年度维保合同', type: '全包服务', startDate: '2026-01-01', endDate: '2026-12-31', amount: 48000, status: '生效中', devices: ['d1', 'd2'], payCycle: '季付', note: '含所有耗材' },
    { id: 'CT002', customer: 'c2', title: '广州智谷科技设备租赁合同', type: '租赁服务', startDate: '2026-03-01', endDate: '2027-02-28', amount: 36000, status: '生效中', devices: ['d3', 'd4'], payCycle: '月付', note: '含基础耗材' },
    { id: 'CT003', customer: 'c3', title: '东莞鑫源印刷计次服务合同', type: '计次服务', startDate: '2026-02-15', endDate: '2027-02-14', amount: 24000, status: '生效中', devices: ['d5', 'd6'], payCycle: '月结', note: '按张计费' },
    { id: 'CT004', customer: 'c4', title: '佛山南海印刷厂维保合同', type: '全包服务', startDate: '2025-06-01', endDate: '2026-05-31', amount: 32000, status: '即将到期', devices: ['d7', 'd8'], payCycle: '半年付', note: '' },
    { id: 'CT005', customer: 'c5', title: '惠州金蝶软件单次服务合同', type: '单次服务', startDate: '2026-03-20', endDate: '2026-03-20', amount: 1500, status: '已完成', devices: ['d9'], payCycle: '单次', note: '驱动安装调试' },
  ])

  // 合同类型
  const contractTypes = ['全包服务', '租赁服务', '计次服务', '单次服务']

  // 结算记录
  const settlements = ref([
    { id: 'S001', customer: 'c1', contract: 'CT001', period: '2026-03', type: '合同结算', amount: 12000, meterReadings: { d1: { b_w: 12500, color: 3200 }, d2: { b_w: 8600, color: 2100 } }, status: '已结算', payDate: '2026-03-25', note: '第一季度' },
    { id: 'S002', customer: 'c2', contract: 'CT002', period: '2026-03', type: '租赁结算', amount: 3000, meterReadings: { d3: { b_w: 5200, color: 1800 }, d4: { b_w: 4800, color: 1200 } }, status: '待收款', payDate: '', note: '' },
    { id: 'S003', customer: 'c3', contract: 'CT003', period: '2026-03', type: '计次结算', amount: 4200, meterReadings: { d5: { b_w: 15600, color: 4200 }, d6: { b_w: 11200, color: 3800 } }, status: '待确认', payDate: '', note: '黑白0.12/张，彩色0.35/张' },
    { id: 'S004', customer: 'c1', contract: 'CT001', period: '2026-02', type: '合同结算', amount: 12000, meterReadings: { d1: { b_w: 11800, color: 2900 }, d2: { b_w: 9200, color: 2400 } }, status: '已结算', payDate: '2026-02-26', note: '' },
  ])

  // 统计数据 - 月度工单
  const monthlyOrders = computed(() => {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    return months.map((m, i) => ({
      month: m,
      total: orders.value.filter(o => new Date(o.created).getMonth() === i).length,
      completed: orders.value.filter(o => new Date(o.created).getMonth() === i && (o.status === '已完成' || o.status === '已关闭')).length
    }))
  })

  // 统计数据 - 工单类型分布
  const ordersByStatus = computed(() => {
    const statusMap = { '待处理': 0, '处理中': 0, '待验收': 0, '已完成': 0, '已关闭': 0 }
    orders.value.forEach(o => { if (statusMap[o.status] !== undefined) statusMap[o.status]++ })
    return Object.entries(statusMap).map(([name, value]) => ({ name, value }))
  })

  // 统计数据 - 技术员工作量
  const techWorkload = computed(() => {
    return techs.value.map(name => ({
      name,
      orders: orders.value.filter(o => o.assignee === name).length,
      completed: orders.value.filter(o => o.assignee === name && (o.status === '已完成' || o.status === '已关闭')).length,
      inspections: inspections.value.filter(i => i.assignee === name).length
    }))
  })

  // 统计数据 - 设备故障统计
  const deviceFaultStats = computed(() => {
    return devices.value.map(d => ({
      name: d.model,
      sn: d.sn,
      customer: getCustomerName(d.customer),
      orders: orders.value.filter(o => o.device === d.id).length,
      status: d.status
    })).sort((a, b) => b.orders - a.orders).slice(0, 10)
  })

  // 统计数据 - 月度收入
  const monthlyRevenue = computed(() => {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    return months.map((m, i) => ({
      month: m,
      settlement: settlements.value.filter(s => new Date(s.period + '-01').getMonth() === i && s.status === '已结算').reduce((sum, s) => sum + s.amount, 0),
      parts: partUsages.value.filter(p => new Date(p.date).getMonth() === i).reduce((sum, p) => sum + p.price, 0)
    }))
  })

  let contractIdCtr = 6
  let settlementIdCtr = 5

  // 技术员列表（从用户账号中筛选，支持工单指派）
  const techs = computed(() => users.value.filter(u => u.role === '技术员' && u.active).map(u => u.name))
  
  // 巡检负责人列表（仅技术员，不含客服）
  const inspectionAssignees = computed(() => users.value.filter(u => u.role === '技术员' && u.active).map(u => u.name))
  
  let orderIdCtr = 16
  let inspIdCtr = 6

  // Computed
  const todayNewOrders = computed(() => orders.value.filter(o => o.created === new Date().toISOString().slice(0, 10)).length)
  const pendingOrders = computed(() => orders.value.filter(o => o.status === '待处理').length)
  const doneOrders = computed(() => orders.value.filter(o => o.status === '已完成' || o.status === '已关闭').length)
  const faultDevices = computed(() => devices.value.filter(d => d.status === '故障' || d.status === '维修中').length)
  const totalDevices = computed(() => devices.value.length)

  // Helpers
  function getCustomerName(id) { const c = customers.value.find(x => x.id === id); return c ? c.name : '-' }
  function getDeviceName(id) { const d = devices.value.find(x => x.id === id); return d ? d.model : '-' }
  function getDevice(id) { return devices.value.find(x => x.id === id) }

  function now() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  }

  function badgeClass(status) {
    const map = { '待处理': 'bg-red-100 text-red-700', '处理中': 'bg-blue-100 text-blue-700', '待验收': 'bg-orange-100 text-orange-700', '已完成': 'bg-green-100 text-green-700', '已关闭': 'bg-gray-100 text-gray-600', '正常': 'bg-green-100 text-green-700', '故障': 'bg-red-100 text-red-700', '维修中': 'bg-orange-100 text-orange-700', '待巡检': 'bg-red-100 text-red-700', '巡检中': 'bg-blue-100 text-blue-700' }
    return map[status] || 'bg-gray-100 text-gray-600'
  }

  function priorityClass(p) {
    return { '紧急': 'bg-red-500 text-white', '高': 'bg-orange-100 text-orange-700', '普通': 'bg-blue-100 text-blue-700', '低': 'bg-gray-100 text-gray-500' }[p] || 'bg-gray-100 text-gray-600'
  }

  // CRUD
  function addOrder(data) {
    const id = 'W202603' + String(orderIdCtr++).padStart(3, '0')
    orders.value.unshift({ id, ...data, created: now(), logs: [{ t: now() + ' 09:00', n: '系统', m: '创建工单' }] })
  }

  function updateOrder(id, data) {
    const idx = orders.value.findIndex(x => x.id === id)
    if (idx > -1) orders.value[idx] = { ...orders.value[idx], ...data }
  }

  function deleteOrder(id) { orders.value = orders.value.filter(x => x.id !== id) }

  function addInspection(data) {
    const id = 'I' + String(inspIdCtr++).padStart(3, '0')
    inspections.value.unshift({ id, ...data })
  }

  function deleteInspection(id) { inspections.value = inspections.value.filter(x => x.id !== id) }

  function addCustomer(data) {
    const id = 'c' + (customers.value.length + 1)
    customers.value.unshift({ id, ...data })
  }

  function deleteCustomer(id) { customers.value = customers.value.filter(x => x.id !== id) }

  function addDevice(data) {
    const id = 'd' + (devices.value.length + 1)
    devices.value.unshift({ id, ...data })
  }

  function deleteDevice(id) { devices.value = devices.value.filter(x => x.id !== id) }

  // Part CRUD
  let partIdCtr = 9
  function addPart(data) {
    const id = 'p' + partIdCtr++
    parts.value.unshift({ id, ...data })
  }
  function updatePart(id, data) {
    const idx = parts.value.findIndex(x => x.id === id)
    if (idx > -1) parts.value[idx] = { ...parts.value[idx], ...data }
  }
  function deletePart(id) { parts.value = parts.value.filter(x => x.id !== id) }
  
  // 配件使用（出库）
  function usePart(data) {
    const part = parts.value.find(p => p.id === data.part)
    if (!part) return false
    if (part.stock < data.qty) return false
    
    // 减少库存
    part.stock -= data.qty
    
    // 记录使用
    const usage = {
      id: 'pu' + partUsageIdCtr++,
      part: data.part,
      partName: part.name,
      order: data.order,
      device: data.device,
      qty: data.qty,
      price: part.price * data.qty,
      user: data.user,
      date: now(),
      note: data.note || ''
    }
    partUsages.value.unshift(usage)
    return true
  }
  
  // 配件入库
  function restockPart(partId, qty) {
    const part = parts.value.find(p => p.id === partId)
    if (part) {
      part.stock += qty
      return true
    }
    return false
  }

  // 合同 CRUD
  function addContract(data) {
    const id = 'CT' + String(contractIdCtr++).padStart(3, '0')
    contracts.value.unshift({ id, ...data })
  }
  function updateContract(id, data) {
    const idx = contracts.value.findIndex(x => x.id === id)
    if (idx > -1) contracts.value[idx] = { ...contracts.value[idx], ...data }
  }
  function deleteContract(id) { contracts.value = contracts.value.filter(x => x.id !== id) }

  // 结算 CRUD
  function addSettlement(data) {
    const id = 'S' + String(settlementIdCtr++).padStart(3, '0')
    settlements.value.unshift({ id, ...data })
  }
  function updateSettlement(id, data) {
    const idx = settlements.value.findIndex(x => x.id === id)
    if (idx > -1) settlements.value[idx] = { ...settlements.value[idx], ...data }
  }
  function deleteSettlement(id) { settlements.value = settlements.value.filter(x => x.id !== id) }

  // User CRUD
  let userIdCtr = 5
  function addUser(data) {
    const id = 'u' + String(userIdCtr++).padStart(2, '0')
    users.value.push({ id, active: true, ...data })
  }
  function updateUser(id, data) {
    const idx = users.value.findIndex(x => x.id === id)
    if (idx > -1) users.value[idx] = { ...users.value[idx], ...data }
  }
  function deleteUser(id) {
    const idx = users.value.findIndex(x => x.id === id)
    if (idx > -1) users.value[idx].active = false
  }

  // 当前技术员可看到的工单（仅指派给自己的）
  const visibleOrders = computed(() => {
    if (isAdmin.value) return orders.value
    return orders.value.filter(o => o.assignee === user.value.name)
  })

  // 当前技术员可看到的巡检（仅分配给自己的）
  const visibleInspections = computed(() => {
    if (isAdmin.value) return inspections.value
    return inspections.value.filter(i => i.assignee === user.value.name)
  })

  return {
    user, isLoggedIn, currentUserId, users, customers, devices, orders, inspections, techs, inspectionAssignees,
    parts, partCategories, partUsages,
    contracts, contractTypes, settlements,
    monthlyOrders, ordersByStatus, techWorkload, deviceFaultStats, monthlyRevenue,
    isAdmin, isTech, isService, visibleOrders, visibleInspections,
    todayNewOrders, pendingOrders, doneOrders, faultDevices, totalDevices,
    getCustomerName, getDeviceName, getDevice, getUserById, verifyLogin, now, badgeClass, priorityClass,
    addOrder, updateOrder, deleteOrder,
    addInspection, deleteInspection,
    addCustomer, deleteCustomer,
    addDevice, deleteDevice,
    addPart, updatePart, deletePart, usePart, restockPart,
    addContract, updateContract, deleteContract,
    addSettlement, updateSettlement, deleteSettlement,
    addUser, updateUser, deleteUser,
  }
})
