<template>
  <Layout>
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <div v-else class="dashboard">
      <div class="section-header">
        <div>
          <p class="section-eyebrow">Ringkasan</p>
          <h2 class="section-title">Statistik Utama</h2>
        </div>
        <div class="section-actions">
          <span class="section-chip">30 hari terakhir</span>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-grid">
        <div class="stat-card variant-primary">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <p class="stat-label">Total Transaksi</p>
            <p class="stat-value">{{ stats.totalTransactions || 0 }}</p>
          </div>
        </div>

        <div class="stat-card variant-indigo">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <p class="stat-label">Total Pendapatan</p>
            <p class="stat-value">Rp {{ formatCurrency(stats.totalRevenue || 0) }}</p>
          </div>
        </div>

        <div class="stat-card variant-emerald">
          <div class="stat-icon">📦</div>
          <div class="stat-content">
            <p class="stat-label">Transaksi Rental</p>
            <p class="stat-value">{{ stats.totalRentals || 0 }}</p>
          </div>
        </div>

        <div class="stat-card variant-amber">
          <div class="stat-icon">🛍️</div>
          <div class="stat-content">
            <p class="stat-label">Transaksi Penjualan</p>
            <p class="stat-value">{{ stats.totalSales || 0 }}</p>
          </div>
        </div>

        <div class="stat-card variant-sky">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <p class="stat-label">Rental Aktif</p>
            <p class="stat-value">{{ stats.activeRentals || 0 }}</p>
          </div>
        </div>

        <div class="stat-card variant-rose">
          <div class="stat-icon">💳</div>
          <div class="stat-content">
            <p class="stat-label">Total Sales + Rental</p>
            <p class="stat-value">Rp {{ formatCurrency(stats.totalPayments || 0) }}</p>
          </div>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="section-header compact">
        <div>
          <p class="section-eyebrow">Aktivitas</p>
          <h2 class="section-title">Transaksi Terkini</h2>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Transaksi Rental Terkini</h3>
          </div>
          <div v-if="recentRentals.length === 0" class="empty-state">
            Tidak ada data
          </div>
          <div v-else class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Tanggal</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="rental in recentRentals.slice(0, 5)" :key="rental.id">
                  <td>{{ rental.transaction_code }}</td>
                  <td>{{ formatDate(rental.rental_date) }}</td>
                  <td>Rp {{ formatCurrency(rental.total_amount) }}</td>
                  <td>
                    <span :class="getStatusBadgeClass(rental.status)">
                      {{ rental.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="card-footer">
            <router-link to="/rental-transactions" class="btn btn-secondary">
              Lihat Semua
            </router-link>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Transaksi Penjualan Terkini</h3>
          </div>
          <div v-if="recentSales.length === 0" class="empty-state">
            Tidak ada data
          </div>
          <div v-else class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Tanggal</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="sale in recentSales.slice(0, 5)" :key="sale.id">
                  <td>{{ sale.transaction_code }}</td>
                  <td>{{ formatDate(sale.sale_date) }}</td>
                  <td>Rp {{ formatCurrency(sale.total_amount) }}</td>
                  <td>
                    <span :class="getStatusBadgeClass(sale.status)">
                      {{ sale.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="card-footer">
            <router-link to="/sales-transactions" class="btn btn-secondary">
              Lihat Semua
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Layout from '@/components/Layout.vue'
import { getDashboardStats, fetchRentalTransactions, fetchSalesTransactions } from '@/services/api'

const loading = ref(true)
const stats = ref({})
const recentRentals = ref([])
const recentSales = ref([])

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID').format(value)
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID')
}

const getStatusBadgeClass = (status) => {
  const classes = {
    active: 'badge badge-success',
    completed: 'badge badge-success',
    pending: 'badge badge-warning',
    cancelled: 'badge badge-danger'
  }
  return classes[status?.toLowerCase()] || 'badge badge-info'
}

const loadData = async () => {
  loading.value = true
  try {
    const [statsResult, rentalsResult, salesResult] = await Promise.all([
      getDashboardStats(),
      fetchRentalTransactions({ limit: 5 }),
      fetchSalesTransactions({ limit: 5 })
    ])

    if (statsResult.success) {
      stats.value = statsResult.data
    }

    if (rentalsResult.success) {
      recentRentals.value = rentalsResult.data || []
    }

    if (salesResult.success) {
      recentSales.value = salesResult.data || []
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  padding: 1.5rem;
  border-radius: 1rem;
  position: relative;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.section-header.compact {
  margin-top: 0.5rem;
}

.section-eyebrow {
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--gray-500);
  margin-bottom: 0.25rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-900);
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-chip {
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: white;
  border: 1px solid rgba(99, 102, 241, 0.2);
  color: #4338ca;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 0.75rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid rgba(148, 163, 184, 0.3);
  box-shadow: 0 12px 24px -20px rgba(15, 23, 42, 0.5);
  position: relative;
  overflow: hidden;
  animation: fadeUp 0.4s ease both;
}

.stat-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.6));
  opacity: 0;
  transition: opacity 0.2s ease;
}

.stat-card:hover::after {
  opacity: 1;
}

.stat-card:nth-child(1) { animation-delay: 0.05s; }
.stat-card:nth-child(2) { animation-delay: 0.1s; }
.stat-card:nth-child(3) { animation-delay: 0.15s; }
.stat-card:nth-child(4) { animation-delay: 0.2s; }
.stat-card:nth-child(5) { animation-delay: 0.25s; }
.stat-card:nth-child(6) { animation-delay: 0.3s; }

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-size: 1.5rem;
  background: rgba(99, 102, 241, 0.12);
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--gray-600);
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--gray-900);
}

.variant-primary .stat-icon {
  background: rgba(99, 102, 241, 0.14);
  color: #4338ca;
}

.variant-indigo .stat-icon {
  background: rgba(79, 70, 229, 0.14);
  color: #4338ca;
}

.variant-emerald .stat-icon {
  background: rgba(16, 185, 129, 0.16);
  color: #047857;
}

.variant-amber .stat-icon {
  background: rgba(245, 158, 11, 0.18);
  color: #b45309;
}

.variant-sky .stat-icon {
  background: rgba(56, 189, 248, 0.18);
  color: #0369a1;
}

.variant-rose .stat-icon {
  background: rgba(244, 63, 94, 0.18);
  color: #be123c;
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.table-wrapper .table {
  min-width: 520px;
}

.card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 0.75rem;
  box-shadow: 0 18px 36px -28px rgba(15, 23, 42, 0.5);
}

.table th {
  font-size: 0.75rem;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.card-footer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--gray-200);
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--gray-500);
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 1.25rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .section-actions {
    width: 100%;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-icon {
    width: 42px;
    height: 42px;
    font-size: 1.3rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .grid-2 {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .dashboard {
    padding: 1rem;
  }

  .stat-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .table-wrapper .table {
    min-width: 480px;
  }
}
</style>
