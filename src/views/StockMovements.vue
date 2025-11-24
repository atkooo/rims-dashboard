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
        <label>Tipe Pergerakan</label>
        <select v-model="filters.movementType" class="form-input">
          <option value="">Semua</option>
          <option value="IN">Masuk (IN)</option>
          <option value="OUT">Keluar (OUT)</option>
        </select>
      </div>
      <button @click="applyFilters" class="btn btn-primary">Filter</button>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <div v-else class="card">
      <div v-if="movements.length === 0" class="empty-state">
        Tidak ada data pergerakan stok
      </div>
      <table v-else class="table">
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
  </Layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Layout from '@/components/Layout.vue'
import { fetchStockMovements } from '@/services/api'

const loading = ref(false)
const movements = ref([])
const filters = ref({
  dateFrom: '',
  dateTo: '',
  movementType: ''
})

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('id-ID')
}

const getMovementBadgeClass = (type) => {
  return type === 'IN' ? 'badge badge-success' : 'badge badge-danger'
}

const loadData = async () => {
  loading.value = true
  try {
    const result = await fetchStockMovements(filters.value)
    if (result.success) {
      movements.value = result.data || []
    }
  } catch (error) {
    console.error('Error loading stock movements:', error)
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

