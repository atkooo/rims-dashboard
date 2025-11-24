<template>
  <Layout>
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <div v-else>
      <!-- Statistics Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <p class="stat-label">Total Transaksi</p>
            <p class="stat-value">{{ stats.totalTransactions || 0 }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <p class="stat-label">Total Pendapatan</p>
            <p class="stat-value">Rp {{ formatCurrency(stats.totalRevenue || 0) }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📦</div>
          <div class="stat-content">
            <p class="stat-label">Transaksi Rental</p>
            <p class="stat-value">{{ stats.totalRentals || 0 }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🛍️</div>
          <div class="stat-content">
            <p class="stat-label">Transaksi Penjualan</p>
            <p class="stat-value">{{ stats.totalSales || 0 }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <p class="stat-label">Rental Aktif</p>
            <p class="stat-value">{{ stats.activeRentals || 0 }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">💳</div>
          <div class="stat-content">
            <p class="stat-label">Total Pembayaran</p>
            <p class="stat-value">Rp {{ formatCurrency(stats.totalPayments || 0) }}</p>
          </div>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="grid-2">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Transaksi Rental Terkini</h3>
          </div>
          <div v-if="recentRentals.length === 0" class="empty-state">
            Tidak ada data
          </div>
          <table v-else class="table">
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
          <table v-else class="table">
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
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.stat-icon {
  font-size: 2.5rem;
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
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-900);
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
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
</style>

