import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from './views/Dashboard.vue'
import Orders from './views/Orders.vue'
import Inspections from './views/Inspections.vue'
import Devices from './views/Devices.vue'
import Customers from './views/Customers.vue'
import Profile from './views/Profile.vue'
import Technicians from './views/Technicians.vue'
import Parts from './views/Parts.vue'
import Contracts from './views/Contracts.vue'
import Settlements from './views/Settlements.vue'
import Statistics from './views/Statistics.vue'
import Login from './views/Login.vue'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', name: 'Login', component: Login },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/orders', name: 'Orders', component: Orders },
  { path: '/inspections', name: 'Inspections', component: Inspections },
  { path: '/devices', name: 'Devices', component: Devices },
  { path: '/customers', name: 'Customers', component: Customers },
  { path: '/parts', name: 'Parts', component: Parts },
  { path: '/contracts', name: 'Contracts', component: Contracts },
  { path: '/settlements', name: 'Settlements', component: Settlements },
  { path: '/statistics', name: 'Statistics', component: Statistics },
  { path: '/technicians', name: 'Technicians', component: Technicians },
  { path: '/profile', name: 'Profile', component: Profile },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
