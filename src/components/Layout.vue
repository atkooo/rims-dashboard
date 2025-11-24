<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>RIMS Dashboard</h2>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/dashboard" class="nav-item">
          <span>📊</span>
          <span>Dashboard</span>
        </router-link>
        <router-link to="/rental-transactions" class="nav-item">
          <span>📦</span>
          <span>Transaksi Rental</span>
        </router-link>
        <router-link to="/sales-transactions" class="nav-item">
          <span>💰</span>
          <span>Transaksi Penjualan</span>
        </router-link>
        <router-link to="/payments" class="nav-item">
          <span>💳</span>
          <span>Pembayaran</span>
        </router-link>
        <router-link to="/stock-movements" class="nav-item">
          <span>📈</span>
          <span>Pergerakan Stok</span>
        </router-link>
        <router-link to="/change-password" class="nav-item">
          <span>🔒</span>
          <span>Ganti Password</span>
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <div class="user-info">
          <span>{{ userEmail }}</span>
        </div>
        <button @click="handleLogout" class="btn btn-secondary btn-block">
          Keluar
        </button>
      </div>
    </aside>
    <main class="main-content">
      <header class="header">
        <h1>{{ pageTitle }}</h1>
      </header>
      <div class="content">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const userEmail = computed(() => authStore.user?.email || '')

const pageTitle = computed(() => {
  const titles = {
    dashboard: 'Dashboard',
    'rental-transactions': 'Transaksi Rental',
    'sales-transactions': 'Transaksi Penjualan',
    payments: 'Pembayaran',
    'stock-movements': 'Pergerakan Stok',
    'change-password': 'Ganti Password'
  }
  return titles[route.name] || 'Dashboard'
})

const handleLogout = async () => {
  await authStore.signOut()
}
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background: white;
  border-right: 1px solid var(--gray-200);
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--gray-200);
}

.sidebar-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-900);
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: var(--gray-700);
  text-decoration: none;
  transition: all 0.2s;
}

.nav-item:hover {
  background-color: var(--gray-50);
  color: var(--primary);
}

.nav-item.router-link-active {
  background-color: #eef2ff;
  color: var(--primary);
  border-right: 3px solid var(--primary);
}

.sidebar-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--gray-200);
}

.user-info {
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: var(--gray-50);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: var(--gray-700);
  text-align: center;
}

.main-content {
  flex: 1;
  margin-left: 250px;
  display: flex;
  flex-direction: column;
}

.header {
  background: white;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--gray-200);
}

.header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--gray-900);
}

.content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}
</style>

