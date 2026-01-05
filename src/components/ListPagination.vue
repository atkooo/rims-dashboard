<template>
  <div class="list-pagination" v-if="showPageSize || totalPages > 1">
    <div v-if="showPageSize" class="page-size">
      <label class="page-size-label">Jumlah Baris</label>
      <select class="form-input" :value="pageSize" @change="onPageSizeChange">
        <option v-for="size in pageSizes" :key="size" :value="size">
          {{ size }}
        </option>
      </select>
    </div>
    <div v-if="totalPages > 1" class="pager">
      <button
        class="btn btn-secondary"
        type="button"
        :disabled="page <= 1"
        @click="updatePage(page - 1)"
      >
        Prev
      </button>
      <span class="pager-info">Halaman {{ page }} dari {{ totalPages }}</span>
      <button
        class="btn btn-secondary"
        type="button"
        :disabled="page >= totalPages"
        @click="updatePage(page + 1)"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 25 },
  totalPages: { type: Number, default: 1 },
  pageSizes: { type: Array, default: () => [10, 25, 50, 100] },
  showPageSize: { type: Boolean, default: true }
})

const emit = defineEmits(['update:page', 'update:pageSize'])

const updatePage = (nextPage) => {
  emit('update:page', nextPage)
}

const onPageSizeChange = (event) => {
  const nextSize = Number(event.target.value)
  emit('update:pageSize', nextSize)
}
</script>

<style scoped>
.list-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.page-size {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-size-label {
  font-size: 0.875rem;
  color: var(--gray-600);
}

.pager {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pager-info {
  font-size: 0.875rem;
  color: var(--gray-600);
}

@media (max-width: 768px) {
  .list-pagination {
    flex-direction: column;
    align-items: stretch;
  }

  .page-size,
  .pager {
    justify-content: center;
  }
}
</style>
