<template>
  <div class="min-h-screen bg-gray-100">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Inventory Management Settings</h1>
      
      <div class="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">General Settings</h2>
        <div class="space-y-4">
          <div>
            <label for="lowStockThreshold" class="block text-sm font-medium text-gray-700">Low Stock Threshold</label>
            <input type="number" id="lowStockThreshold" v-model="settings.lowStockThreshold" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
          </div>
          <div>
            <label for="expiryNotificationDays" class="block text-sm font-medium text-gray-700">Expiry Notification Days</label>
            <input type="number" id="expiryNotificationDays" v-model="settings.expiryNotificationDays" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
          </div>
        </div>
      </div>
      
      <div class="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Notification Preferences</h2>
        <div class="space-y-4">
          <div class="flex items-center">
            <input type="checkbox" id="emailNotifications" v-model="settings.emailNotifications" class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
            <label for="emailNotifications" class="ml-2 block text-sm text-gray-900">Receive email notifications</label>
          </div>
          <div class="flex items-center">
            <input type="checkbox" id="pushNotifications" v-model="settings.pushNotifications" class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
            <label for="pushNotifications" class="ml-2 block text-sm text-gray-900">Receive push notifications</label>
          </div>
        </div>
      </div>
      
      <div class="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Report Generation</h2>
        <div class="space-y-4">
          <div>
            <label for="defaultReportPeriod" class="block text-sm font-medium text-gray-700">Default Report Period</label>
            <select id="defaultReportPeriod" v-model="settings.defaultReportPeriod" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>
          <div class="flex items-center">
            <input type="checkbox" id="autoGenerateReports" v-model="settings.autoGenerateReports" class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
            <label for="autoGenerateReports" class="ml-2 block text-sm text-gray-900">Auto-generate reports</label>
          </div>
        </div>
      </div>
      
      <div class="flex justify-end">
        <button @click="saveSettings" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          Save Settings
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { CheckIcon } from 'lucide-vue-next'

const settings = ref({
  lowStockThreshold: 10,
  expiryNotificationDays: 30,
  emailNotifications: true,
  pushNotifications: false,
  defaultReportPeriod: 'monthly',
  autoGenerateReports: true
})

onMounted(async () => {
  try {
    const response = await fetch('http://localhost:3000/api/settings')
    const data = await response.json()
    if (data.success) {
      settings.value = { ...settings.value, ...data.data }
    }
  } catch (error) {
    console.error('Failed to fetch settings:', error)
  }
})

const saveSettings = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings.value)
    })
    const data = await response.json()
    if (data.success) {
      console.log('Settings saved successfully')
    } else {
      console.error('Failed to save settings:', data.error)
    }
  } catch (error) {
    console.error('Error saving settings:', error)
  }
}
</script>