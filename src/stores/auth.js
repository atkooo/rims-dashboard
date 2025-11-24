import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/config/supabase'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const session = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!user.value)

  // Initialize auth state
  async function init() {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      session.value = currentSession
      user.value = currentSession?.user ?? null

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, newSession) => {
        session.value = newSession
        user.value = newSession?.user ?? null
      })
    } catch (err) {
      console.error('Error initializing auth:', err)
      error.value = err.message
    }
  }

  // Sign up
  async function signUp(email, password, metadata = {}) {
    loading.value = true
    error.value = null
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })

      if (authError) throw authError
      
      user.value = data.user
      session.value = data.session
      return { success: true, data }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Sign in
  async function signIn(email, password) {
    loading.value = true
    error.value = null
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) throw authError
      
      user.value = data.user
      session.value = data.session
      router.push('/dashboard')
      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Sign out
  async function signOut() {
    loading.value = true
    error.value = null
    try {
      const { error: authError } = await supabase.auth.signOut()
      if (authError) throw authError
      
      user.value = null
      session.value = null
      router.push('/login')
      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Reset password
  async function resetPassword(email) {
    loading.value = true
    error.value = null
    try {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      if (authError) throw authError
      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    session,
    loading,
    error,
    isAuthenticated,
    init,
    signUp,
    signIn,
    signOut,
    resetPassword
  }
})

