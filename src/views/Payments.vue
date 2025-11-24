<template>
  <Layout>
    <div class="page-header">
      <div>
        <h2>Pembayaran</h2>
        <p>Daftar semua pembayaran yang telah disinkronkan</p>
      </div>
      <button @click="loadData" class="btn btn-secondary" :disabled="loading">
        🔄 Refresh
      </button>
    </div>

    <div class="filters">
      <div class="filter-group">
        <label>Dari Tanggal</label>
        <input v-model="filters.dateFrom" type="date" class="form-input" />
      </div>
      <div class="filter-group">
        <label>Sampai Tanggal</label>
        <input v-model="filters.dateTo" type="date" class="form-input" />
      </div>
      <div class="filter-group">
        <label>Tipe Transaksi</label>
        <select v-model="filters.transactionType" class="form-input">
          <option value="">Semua</option>
          <option value="rental">Rental</option>
          <option value="sales">Sales</option>
        </select>
      </div>
      <button @click="applyFilters" class="btn btn-primary">Filter</button>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <div v-else class="card">
      <div v-if="payments.length === 0" class="empty-state">
        Tidak ada data pembayaran
      </div>
      <table v-else class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tipe Transaksi</th>
            <th>Transaction ID</th>
            <th>Tanggal</th>
            <th>Jumlah</th>
            <th>Metode</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="payment in payments" :key="payment.id">
            <td>{{ payment.id }}</td>
            <td>
              <span :class="getTypeBadgeClass(payment.transaction_type)">
                {{ payment.transaction_type }}
              </span>
            </td>
            <td>{{ payment.transaction_id }}</td>
            <td>{{ formatDateTime(payment.payment_date) }}</td>
            <td>Rp {{ formatCurrency(payment.amount) }}</td>
            <td>{{ payment.payment_method }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Layout from '@/components/Layout.vue'
import { fetchPayments } from '@/services/api'

const loading = ref(false)
const payments = ref([])
const filters = ref({
  dateFrom: '',
  dateTo: '',
  transactionType: ''
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID').format(value || 0)
}

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('id-ID')
}

const getTypeBadgeClass = (type) => {
  return type === 'rental' ? 'badge badge-info' : 'badge badge-success'
}

const loadData = async () => {
  loading.value = true
  try {
    const result = await fetchPayments(filters.value)
    if (result.success) {
      payments.value = result.data || []
    }
  } catch (error) {
    console.error('Error loading payments:', error)
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.page-header p {
  color: var(--gray-600);
  font-size: 0.875rem;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-700);
}
</style>

