import { ref } from 'vue'

// Shared state for authentication
export const isLoggedIn = ref(!!localStorage.getItem('authToken'))

export const login = (token) => {
  localStorage.setItem('authToken', token)
  isLoggedIn.value = true
}

export const logout = () => {
  localStorage.removeItem('authToken')
  isLoggedIn.value = false
}
