<template>
  <header class="bg-white shadow-sm">
    <div class="flex items-center justify-between p-4">
      <button @click="$emit('toggle-sidebar')" class="text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md">
        <span class="sr-only">Toggle Sidebar</span>
        <Menu class="h-6 w-6" />
      </button>
      
      <button @click="showNotification" class="text-gray-500 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md relative">
        <span class="sr-only">Notifications</span>
        <Bell class="h-6 w-6" />
        <span v-if="unreadNotifications" class="absolute -top-1 -right-1 block h-3 w-3 rounded-full bg-red-500"></span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useToast } from 'vue-toastification'
import { Menu, Bell } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const unreadNotifications = ref(false)
const toast = useToast()
const router = useRouter()
let fetchInterval = null

const fetchNotifications = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/inventory/notifications')
    const data = await response.json()
    const hasUnreadNotifications = data.data.some(notification => !notification.seen)
    if (hasUnreadNotifications && !unreadNotifications.value) {
      showToast()
    }
    unreadNotifications.value = hasUnreadNotifications
  } catch (error) {
    console.error('Error fetching notifications:', error)
  }
}

const showToast = () => {
  toast.info("You have new notifications", {
    position: "top-right",
    timeout: 5000,
    hideProgressBar: false,
    closeButton: true,
    icon: true,
    rtl: false,
    onClick: () => {
      router.push('/notifications')  // Redirect to the notifications page
      toast.clear()  // Clears the toast when clicked
    }
  })
}

const showNotification = () => {
  router.push('/notifications')
}

onMounted(() => {
  fetchNotifications()
  fetchInterval = setInterval(fetchNotifications, 5000)
})

onUnmounted(() => {
  if (fetchInterval) {
    clearInterval(fetchInterval)
  }
})
</script>

<style>
/* Add your styles here */
</style>
