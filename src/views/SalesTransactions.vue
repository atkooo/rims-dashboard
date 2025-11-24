<template>
  <Layout>
    <div class="page-header">
      <div>
        <h2>Transaksi Penjualan</h2>
        <p>Daftar semua transaksi penjualan yang telah disinkronkan</p>
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
        <label>Status</label>
        <select v-model="filters.status" class="form-input">
          <option value="">Semua</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <button @click="applyFilters" class="btn btn-primary">Filter</button>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <div v-else class="card">
      <div v-if="transactions.length === 0" class="empty-state">
        Tidak ada data transaksi
      </div>
      <table v-else class="table">
        <thead>
          <tr>
            <th>Kode Transaksi</th>
            <th>Tanggal</th>
            <th>Customer ID</th>
            <th>Subtotal</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="transaction in transactions" :key="transaction.id">
            <td>{{ transaction.transaction_code }}</td>
            <td>{{ formatDate(transaction.sale_date) }}</td>
            <td>{{ transaction.customer_id }}</td>
            <td>Rp {{ formatCurrency(transaction.subtotal) }}</td>
            <td>Rp {{ formatCurrency(transaction.total_amount) }}</td>
            <td>
              <span :class="getStatusBadgeClass(transaction.status)">
                {{ transaction.status }}
              </span>
            </td>
            <td>
              <button @click="viewDetails(transaction.id)" class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">
                Detail
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="detailsOpen" class="details-modal" @click.self="detailsOpen = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Detail Transaksi</h3>
            <button @click="detailsOpen = false" class="btn btn-secondary">✕</button>
          </div>
          <div v-if="selectedDetails.length === 0" class="loading">
            <div class="spinner"></div>
          </div>
          <table v-else class="table">
            <thead>
              <tr>
                <th>Item ID</th>
                <th>Quantity</th>
                <th>Harga Jual</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="detail in selectedDetails" :key="detail.id">
                <td>{{ detail.item_id }}</td>
                <td>{{ detail.quantity }}</td>
                <td>Rp {{ formatCurrency(detail.sale_price) }}</td>
                <td>Rp {{ formatCurrency(detail.subtotal) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Layout from '@/components/Layout.vue'
import { fetchSalesTransactions, fetchSalesTransactionDetails } from '@/services/api'

const loading = ref(false)
const transactions = ref([])
const filters = ref({
  dateFrom: '',
  dateTo: '',
  status: ''
})
const detailsOpen = ref(false)
const selectedDetails = ref([])

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID').format(value || 0)
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID')
}

const getStatusBadgeClass = (status) => {
  const classes = {
    completed: 'badge badge-success',
    pending: 'badge badge-warning',
    cancelled: 'badge badge-danger'
  }
  return classes[status?.toLowerCase()] || 'badge badge-info'
}

const loadData = async () => {
  loading.value = true
  try {
    const result = await fetchSalesTransactions(filters.value)
    if (result.success) {
      transactions.value = result.data || []
    }
  } catch (error) {
    console.error('Error loading sales transactions:', error)
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  loadData()
}

const viewDetails = async (transactionId) => {
  detailsOpen.value = true
  selectedDetails.value = []
  const result = await fetchSalesTransactionDetails(transactionId)
  if (result.success) {
    selectedDetails.value = result.data || []
  }
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

.details-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  max-width: 800px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--gray-200);
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
}
</style>

