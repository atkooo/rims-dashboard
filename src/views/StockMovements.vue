<template>
  <Layout>
    <div class="page-header">
      <div>
        <h2>Pergerakan Stok</h2>
        <p>Daftar semua pergerakan stok yang telah disinkronkan</p>
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
        <label>Tipe Pergerakan</label>
        <select v-model="filters.movementType" class="form-input">
          <option value="">Semua</option>
          <option value="IN">Masuk (IN)</option>
          <option value="OUT">Keluar (OUT)</option>
        </select>
      </div>
      <div class="filter-actions">
        <button @click="applyFilters" class="btn btn-primary">Filter</button>
      </div>
    </div>

    <div class="summary-grid">
      <div class="summary-card">
        <p class="summary-label">Total Pergerakan</p>
        <p class="summary-value">{{ totalCount }}</p>
      </div>
      <div class="summary-card">
        <p class="summary-label">Masuk (IN)</p>
        <p class="summary-value">{{ totalIn }}</p>
      </div>
      <div class="summary-card">
        <p class="summary-label">Keluar (OUT)</p>
        <p class="summary-value">{{ totalOut }}</p>
      </div>
      <div class="summary-card">
        <p class="summary-label">Net</p>
        <p class="summary-value">{{ totalIn - totalOut }}</p>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <div v-else class="card">
      <div v-if="movements.length === 0" class="empty-state">
        Tidak ada data pergerakan stok
      </div>
      <div v-else class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Item ID</th>
              <th>Tipe</th>
              <th>Referensi Tipe</th>
              <th>Referensi ID</th>
              <th>Quantity</th>
              <th>Stok Sebelum</th>
              <th>Stok Sesudah</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="movement in movements" :key="movement.id">
              <td>{{ movement.id }}</td>
              <td>{{ movement.item_id }}</td>
              <td>
                <span :class="getMovementBadgeClass(movement.movement_type)">
                  {{ movement.movement_type }}
                </span>
              </td>
              <td>{{ movement.reference_type }}</td>
              <td>{{ movement.reference_id }}</td>
              <td>{{ movement.quantity }}</td>
              <td>{{ movement.stock_before }}</td>
              <td>{{ movement.stock_after }}</td>
              <td>{{ formatDateTime(movement.created_at) }}</td>
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
import { fetchStockMovements } from '@/services/api'

const loading = ref(false)
const movements = ref([])
const totalCount = ref(0)
const filters = ref({
  dateFrom: '',
  dateTo: '',
  movementType: '',
  limit: 25,
  page: 1
})

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('id-ID')
}

const getMovementBadgeClass = (type) => {
  return type === 'IN' ? 'badge badge-success' : 'badge badge-danger'
}

const totalIn = computed(() =>
  movements.value
    .filter((movement) => movement.movement_type === 'IN')
    .reduce((sum, movement) => sum + (parseFloat(movement.quantity) || 0), 0)
)

const totalOut = computed(() =>
  movements.value
    .filter((movement) => movement.movement_type === 'OUT')
    .reduce((sum, movement) => sum + (parseFloat(movement.quantity) || 0), 0)
)

const loadData = async () => {
  loading.value = true
  try {
    const result = await fetchStockMovements(filters.value)
    if (result.success) {
      movements.value = result.data || []
      totalCount.value = result.count || 0
    }
  } catch (error) {
    console.error('Error loading stock movements:', error)
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  filters.value.page = 1
  loadData()
}

const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalCount.value / (filters.value.limit || 1)))
)

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
  min-width: 900px;
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
    min-width: 820px;
  }
}

@media (max-width: 480px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .table-wrapper .table {
    min-width: 720px;
  }
}
</style>

