<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>RIMS Dashboard</h1>
        <p>Masuk ke akun Anda</p>
      </div>

      <div v-if="error" class="alert alert-error">
        {{ error }}
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
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
            placeholder="••••••••"
            required
          />
        </div>

        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span v-else>Masuk</span>
        </button>
      </form>

      <div class="login-footer">
        <p>
          Belum punya akun?
          <router-link to="/register">Daftar di sini</router-link>
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
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  const result = await authStore.signIn(email.value, password.value)

  if (!result.success) {
    error.value = result.error || 'Gagal masuk. Periksa email dan password Anda.'
  }

  loading.value = false
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  background: white;
  border-radius: 0.5rem;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 0.5rem;
}

.login-header p {
  color: var(--gray-600);
  font-size: 0.875rem;
}

.login-form {
  margin-bottom: 1.5rem;
}

.btn-block {
  width: 100%;
  justify-content: center;
}

.login-footer {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid var(--gray-200);
}

.login-footer p {
  color: var(--gray-600);
  font-size: 0.875rem;
}

.login-footer a {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
}

.login-footer a:hover {
  text-decoration: underline;
}
</style>

