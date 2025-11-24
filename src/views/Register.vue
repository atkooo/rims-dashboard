<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h1>Daftar Akun Baru</h1>
        <p>Buat akun untuk mengakses dashboard</p>
      </div>

      <div v-if="error" class="alert alert-error">
        {{ error }}
      </div>

      <div v-if="success" class="alert alert-success">
        Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label class="form-label" for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="form-input"
            placeholder="nama@example.com"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-input"
            placeholder="Minimal 6 karakter"
            required
            minlength="6"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="confirmPassword">Konfirmasi Password</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            class="form-input"
            placeholder="Ulangi password"
            required
          />
        </div>

        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span v-else>Daftar</span>
        </button>
      </form>

      <div class="register-footer">
        <p>
          Sudah punya akun?
          <router-link to="/login">Masuk di sini</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref(false)
const loading = ref(false)

const handleRegister = async () => {
  error.value = ''
  success.value = false

  if (password.value !== confirmPassword.value) {
    error.value = 'Password dan konfirmasi password tidak sama'
    return
  }

  if (password.value.length < 6) {
    error.value = 'Password minimal 6 karakter'
    return
  }

  loading.value = true

  const result = await authStore.signUp(email.value, password.value)

  if (result.success) {
    success.value = true
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  } else {
    error.value = result.error || 'Gagal mendaftar. Silakan coba lagi.'
  }

  loading.value = false
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-card {
  background: white;
  border-radius: 0.5rem;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.register-header h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 0.5rem;
}

.register-header p {
  color: var(--gray-600);
  font-size: 0.875rem;
}

.register-form {
  margin-bottom: 1.5rem;
}

.btn-block {
  width: 100%;
  justify-content: center;
}

.register-footer {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid var(--gray-200);
}

.register-footer p {
  color: var(--gray-600);
  font-size: 0.875rem;
}

.register-footer a {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
}

.register-footer a:hover {
  text-decoration: underline;
}
</style>

