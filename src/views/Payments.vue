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
        <label>Tipe Transaksi</label>
        <select v-model="filters.transactionType" class="form-input">
          <option value="">Semua</option>
          <option value="rental">Rental</option>
          <option value="sales">Sales</option>
        </select>
      </div>
      <div class="filter-actions">
        <button @click="applyFilters" class="btn btn-primary">Filter</button>
      </div>
    </div>

    <div class="summary-grid">
      <div class="summary-card">
        <p class="summary-label">Total Pembayaran</p>
        <p class="summary-value">{{ totalCount }}</p>
      </div>
      <div class="summary-card">
        <p class="summary-label">Nominal Total</p>
        <p class="summary-value">Rp {{ formatCurrency(totalAmount) }}</p>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <div v-else class="card">
      <div v-if="payments.length === 0" class="empty-state">
        Tidak ada data pembayaran
      </div>
      <div v-else class="table-wrapper">
        <table class="table">
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
      <ListPagination
        :page="filters.page"
        :page-size="filters.limit"
        :total-pages="totalPages"
        @update:page="handlePageChange"
        @update:pageSize="handlePageSizeChange"
      />
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Layout from '@/components/Layout.vue'
import ListPagination from '@/components/ListPagination.vue'
import { fetchPayments } from '@/services/api'

const loading = ref(false)
const payments = ref([])
const totalCount = ref(0)
const filters = ref({
  dateFrom: '',
  dateTo: '',
  transactionType: '',
  limit: 25,
  page: 1
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID').format(value || 0)
}

const totalAmount = computed(() =>
  payments.value.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0)
)

const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalCount.value / (filters.value.limit || 1)))
)

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
      totalCount.value = result.count || 0
    }
  } catch (error) {
    console.error('Error loading payments:', error)
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
  min-width: 640px;
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
}

@media (max-width: 480px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .table-wrapper .table {
    min-width: 520px;
  }
}
</style>

