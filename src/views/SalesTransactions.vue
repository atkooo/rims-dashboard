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

    <div class="filters card filters-card">
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
      <div class="filter-actions">
        <button @click="applyFilters" class="btn btn-primary">Filter</button>
      </div>
    </div>

    <div class="summary-grid">
      <div class="summary-card">
        <p class="summary-label">Total Transaksi</p>
        <p class="summary-value">{{ totalCount }}</p>
      </div>
      <div class="summary-card">
        <p class="summary-label">Subtotal</p>
        <p class="summary-value">Rp {{ formatCurrency(totalSubtotal) }}</p>
      </div>
      <div class="summary-card">
        <p class="summary-label">Total Penjualan</p>
        <p class="summary-value">Rp {{ formatCurrency(totalAmount) }}</p>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <div v-else class="card">
      <div v-if="transactions.length === 0" class="empty-state">
        Tidak ada data transaksi
      </div>
      <div v-else class="table-wrapper">
        <table class="table">
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
                <button @click="viewDetails(transaction.id)" class="btn btn-secondary btn-xs">
                  Detail
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ListPagination
        :page="filters.page"
        :page-size="filters.limit"
        :total-pages="totalPages"
        @update:page="handlePageChange"
        @update:pageSize="handlePageSizeChange"
      />

      <div v-if="detailsOpen" class="details-modal" @click.self="detailsOpen = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Detail Transaksi</h3>
            <button @click="detailsOpen = false" class="btn btn-secondary">✕</button>
          </div>
          <div v-if="selectedDetails.length === 0" class="loading">
            <div class="spinner"></div>
          </div>
          <div v-else class="table-wrapper">
            <table class="table">
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
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Layout from '@/components/Layout.vue'
import ListPagination from '@/components/ListPagination.vue'
import { fetchSalesTransactions, fetchSalesTransactionDetails } from '@/services/api'

const loading = ref(false)
const transactions = ref([])
const totalCount = ref(0)
const filters = ref({
  dateFrom: '',
  dateTo: '',
  status: '',
  limit: 25,
  page: 1
})
const detailsOpen = ref(false)
const selectedDetails = ref([])

const totalSubtotal = computed(() =>
  transactions.value.reduce((sum, t) => sum + (parseFloat(t.subtotal) || 0), 0)
)
const totalAmount = computed(() =>
  transactions.value.reduce((sum, t) => sum + (parseFloat(t.total_amount) || 0), 0)
)

const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalCount.value / (filters.value.limit || 1)))
)

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
      totalCount.value = result.count || 0
    }
  } catch (error) {
    console.error('Error loading sales transactions:', error)
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  filters.value.page = 1
  loadData()
}

const handlePageChange = (page) => {
  filters.value.page = page
  loadData()
}

const handlePageSizeChange = (size) => {
  filters.value.limit = size
  filters.value.page = 1
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

.filters-card {
  align-items: flex-end;
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

.filter-actions {
  display: flex;
  align-items: flex-end;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.summary-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
  border: 1px solid var(--gray-200);
  box-shadow: 0 10px 20px -18px rgba(15, 23, 42, 0.4);
}

.summary-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--gray-500);
  margin-bottom: 0.4rem;
}

.summary-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-900);
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.table-wrapper .table {
  min-width: 720px;
}

.btn-xs {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
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

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .filters {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-actions {
    width: 100%;
  }

  .filter-actions .btn {
    width: 100%;
  }

  .table-wrapper .table {
    min-width: 640px;
  }
}

@media (max-width: 480px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .table-wrapper .table {
    min-width: 560px;
  }
}
</style>
