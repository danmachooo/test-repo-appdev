import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('authToken') || null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
  },
  actions: {
    login(token) {
      this.token = token
      localStorage.setItem('authToken', token)
    },
    logout() {
      this.token = null
      localStorage.removeItem('authToken')
    },
    checkAuth() {
      const token = localStorage.getItem('authToken')
      if (token) {
        this.token = token
      }
    },
  },
})