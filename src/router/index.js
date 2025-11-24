import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/rental-transactions',
      name: 'RentalTransactions',
      component: () => import('@/views/RentalTransactions.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/sales-transactions',
      name: 'SalesTransactions',
      component: () => import('@/views/SalesTransactions.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/payments',
      name: 'Payments',
      component: () => import('@/views/Payments.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/stock-movements',
      name: 'StockMovements',
      component: () => import('@/views/StockMovements.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/change-password',
      name: 'ChangePassword',
      component: () => import('@/views/ChangePassword.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Initialize auth if not already done
  if (!authStore.session) {
    await authStore.init()
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (requiresGuest && authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router

