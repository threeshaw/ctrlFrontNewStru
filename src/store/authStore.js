import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: localStorage.getItem('isAuthenticated') === 'true' || false,
    user: localStorage.getItem('user') || null,
    projectSaved: localStorage.getItem('projectSaved') === 'true' || false
  }),
  actions: {
    login(username, password) {
      if (username === 'SIA-APC' && password === '123456') {
        this.isAuthenticated = true
        this.user = username
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('user', username)
        return true
      }
      return false
    },
    logout() {
      this.isAuthenticated = false
      this.user = null
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('user')
    },
    setProjectSaved(status) {
      this.projectSaved = status
      localStorage.setItem('projectSaved', status.toString())
    }
  }
})