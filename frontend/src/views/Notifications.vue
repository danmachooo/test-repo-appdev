<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-gray-800 text-3xl font-bold mb-4">Notifications</h1>
    <p class="text-gray-600 mb-6">View and manage alerts for inventory items and batches.</p>

    <!-- Filter buttons and Mark All as Read -->
    <div class="flex flex-wrap gap-2 mb-6 items-center">
      <div class="flex-grow flex flex-wrap gap-2">
        <button
          v-for="type in notificationTypes"
          :key="type"
          @click="setFilter(type)"
          class="px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200"
          :class="filter === type ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
        >
          {{ type }}
        </button>
      </div>
      <button
        v-if="filteredNotifications.length > 0"
        @click="markAllAsRead"
        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300"
      >
        Mark All as Read
      </button>
    </div>

    <!-- Notifications list -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-4 text-gray-600">Loading notifications...</p>
    </div>
    <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
      <p class="font-bold">Error</p>
      <p>{{ error }}</p>
    </div>
    <div v-else-if="filteredNotifications.length === 0" class="text-center py-8">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p class="mt-4 text-gray-600">No notifications at this time.</p>
    </div>
    <div v-else class="space-y-4">
      <div
        v-for="notification in filteredNotifications"
        :key="notification.id"
        class="bg-white shadow-lg rounded-lg p-6 transition-all duration-300 hover:shadow-xl"
        :class="getNotificationClass(notification.notification_type)"
      >
        <div class="flex justify-between items-start">
          <div>
            <h2 class="text-xl font-semibold text-gray-800 mb-2">
              {{ notification.title }}
            </h2>
            <p class="text-gray-600 mb-2">{{ notification.message }}</p>
            <p class="text-sm text-gray-500">{{ formatDate(notification.created_at) }}</p>
          </div>
          <div class="flex flex-col space-y-2">
            <button 
              v-if="notification.notification_type === 'EXPIRED'"
              @click="disposeBatch(notification)"
              class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300"
            >
              Dispose
            </button>
            <button 
              v-if="notification.notification_type === 'REORDER'"
              @click="reorderItem(notification)"
              class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300"
            >
              Reorder
            </button>
            <button 
              @click="markAsSeen(notification.id)"
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
            >
              Mark as Seen
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import axios from 'axios'

const notifications = ref([])
const loading = ref(true)
const error = ref(null)
const filter = ref('ALL')
const API_URL = 'http://localhost:5000/api/inventory'

const notificationTypes = ['ALL', 'LOW_STOCK', 'EXPIRED', 'SOON_EXPIRING', 'REORDER']

const fetchNotifications = async () => {
  try {
    loading.value = true
    const response = await axios.get(`${API_URL}/notifications`)
    const newNotifications = response.data.data

    // Avoid duplication by checking if the notification already exists
    newNotifications.forEach(newNotification => {
      if (!notifications.value.some(existingNotification => existingNotification.id === newNotification.id)) {
        notifications.value.push(newNotification)
      }
    })

    // Remove notifications that no longer exist in the response
    notifications.value = notifications.value.filter(existingNotification => 
      newNotifications.some(newNotification => newNotification.id === existingNotification.id)
    )

  } catch (err) {
    error.value = 'Failed to fetch notifications. Please try again later.'
    console.error('Error fetching notifications:', err)
  } finally {
    loading.value = false
  }
}

const filteredNotifications = computed(() => {
  if (filter.value === 'ALL') return notifications.value
  return notifications.value.filter(n => n.notification_type === filter.value)
})

const setFilter = (type) => {
  filter.value = type
}

const disposeBatch = async (notification) => {
  try {
    await axios.post(`${API_URL}/batches/${notification.batch_id}/dispose`)
    window.location.href = `/batch-management`
    await markAsSeen(notification.id)
  } catch (err) {
    console.error('Error disposing batch:', err)
  }
}

const reorderItem = async (notification) => {
  try {
    console.log(`Reordering item with ID: ${notification.inventory_item_id}`)
    window.location.href = `/batch-management`
    await markAsSeen(notification.id)
  } catch (err) {
    console.error('Error reordering item:', err)
  }
}

const markAsSeen = async (id) => {
  try {
    await axios.patch(`${API_URL}/notifications/${id}`, { seen: true })
    notifications.value = notifications.value.filter(n => n.id !== id)
  } catch (err) {
    console.error('Error marking notification as seen:', err)
  }
}

const markAllAsRead = async () => {
  try {
    const notificationsToMark = filteredNotifications.value.map(n => n.id)
    await axios.post(`${API_URL}/notifications/mark-all-seen`, { 
      ids: notificationsToMark,
      type: filter.value === 'ALL' ? undefined : filter.value
    })
    if (filter.value === 'ALL') {
      notifications.value = []
    } else {
      notifications.value = notifications.value.filter(n => n.notification_type !== filter.value)
    }
  } catch (err) {
    console.error('Error marking all notifications as seen:', err)
    error.value = 'Failed to mark all notifications as read. Please try again.'
  }
}

const getNotificationClass = (type) => {
  const classes = {
    'LOW_STOCK': 'border-l-4 border-yellow-500',
    'EXPIRED': 'border-l-4 border-red-500',
    'SOON_EXPIRING': 'border-l-4 border-blue-500',
    'REORDER': 'border-l-4 border-green-500'
  }
  return classes[type] || ''
}

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown Date'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Set up polling
let pollingInterval

onMounted(() => {
  fetchNotifications()
  pollingInterval = setInterval(fetchNotifications, 5000) // Poll every 5 seconds
})

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval)
})

// Watch for changes in notifications and update the view
watch(notifications, () => {
  // This will trigger a re-render when notifications change
}, { deep: true })
</script>