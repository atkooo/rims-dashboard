<template>
  <Layout>
    <div class="change-password-container">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Ganti Password</h2>
          <p class="card-subtitle">Ubah password akun Anda</p>
        </div>

        <div v-if="error" class="alert alert-error">
          {{ error }}
        </div>

        <div v-if="success" class="alert alert-success">
          Password berhasil diubah!
        </div>

        <form @submit.prevent="handleChangePassword" class="change-password-form">
          <div class="form-group">
            <label class="form-label" for="currentPassword">Password Saat Ini</label>
            <input
              id="currentPassword"
              v-model="currentPassword"
              type="password"
              class="form-input"
              placeholder="Masukkan password saat ini"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="newPassword">Password Baru</label>
            <input
              id="newPassword"
              v-model="newPassword"
              type="password"
              class="form-input"
              placeholder="Minimal 6 karakter"
              required
              minlength="6"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="confirmPassword">Konfirmasi Password Baru</label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              class="form-input"
              placeholder="Ulangi password baru"
              required
            />
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="spinner"></span>
              <span v-else>Ubah Password</span>
            </button>
            <router-link to="/dashboard" class="btn btn-secondary">
              Batal
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Layout from '@/components/Layout.vue'

const router = useRouter()
const authStore = useAuthStore()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref(false)
const loading = ref(false)

const handleChangePassword = async () => {
  error.value = ''
  success.value = false

  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Password baru dan konfirmasi password tidak sama'
    return
  }

  if (newPassword.value.length < 6) {
    error.value = 'Password baru minimal 6 karakter'
    return
  }

  if (currentPassword.value === newPassword.value) {
    error.value = 'Password baru harus berbeda dengan password saat ini'
    return
  }

  loading.value = true

  // Note: Supabase doesn't require current password for updateUser
  // In production, you might want to verify current password first
  const result = await authStore.changePassword(newPassword.value)

  if (result.success) {
    success.value = true
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  } else {
    error.value = result.error || 'Gagal mengubah password. Silakan coba lagi.'
  }

  loading.value = false
}
</script>

<style scoped>
.change-password-container {
  max-width: 500px;
  margin: 0 auto;
}

.card {
  background: white;
  border-radius: 0.5rem;
  padding: 2rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.card-header {
  margin-bottom: 2rem;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 0.5rem;
}

.card-subtitle {
  color: var(--gray-600);
  font-size: 0.875rem;
}

.change-password-form {
  margin-top: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-700);
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.form-actions .btn {
  flex: 1;
}
</style>

