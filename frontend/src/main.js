
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import '@/assets/styles/index.css' // Assuming you have a file for Tailwind CSS
import 'sweetalert2/dist/sweetalert2.min.css'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import { createPinia } from 'pinia'

const app = createApp(App)
app.use(router)
app.use(Toast)
// Create a Pinia instance
const pinia = createPinia()

// Use Pinia in the app
app.use(pinia)
app.mount('#app')
    