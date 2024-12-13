<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-semibold text-gray-800">Batch Management</h1>
      <button
        @click="openAddModal"
        class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition duration-300"
      >
        <PlusIcon class="h-5 w-5" />
        Add New Batch
      </button>
    </div>

    <!-- Filtering -->
    <div class="mb-6 flex flex-wrap gap-4">
      <input
        v-model="filters.search"
        placeholder="Search batches..."
        class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <select
        v-model="filters.item"
        class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Items</option>
        <option v-for="item in inventoryItems" :key="item.id" :value="item.id">
          {{ item.name }}
        </option>
      </select>
      <select
        v-model="filters.status"
        class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Statuses</option>
        <option value="active">Active</option>
        <option value="expired">Expired</option>
      </select>
    </div>

    <!-- Batches List -->
    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th v-for="header in tableHeaders" :key="header" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ header }}
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="batch in paginatedBatches" :key="batch.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">{{ batch.batch_number }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ batch.inventoryItem?.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ batch.quantity }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ formatDate(batch.expiry_date) }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ batch.supplier }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ formatDate(batch.received_date) }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getBatchStatusClass(batch)">
                {{ getBatchStatus(batch) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap space-x-2">
              <button 
                @click="editBatch(batch)" 
                class="text-blue-600 hover:text-blue-900 transition duration-300"
                title="Edit Batch"
              >
                <PencilIcon class="h-5 w-5" />
              </button>
              <button 
                @click="confirmDispose(batch)" 
                class="text-red-600 hover:text-red-900 transition duration-300"
                title="Dispose Batch"
              >
                <ArchiveIcon class="h-5 w-5" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="mt-6 flex justify-between items-center">
      <div>
        <span class="text-sm text-gray-700">
          Showing {{ paginationStart }} to {{ paginationEnd }} of {{ filteredBatches.length }} entries
        </span>
      </div>
      <div class="space-x-2">
        <button 
          @click="prevPage" 
          :disabled="currentPage === 1" 
          class="px-3 py-1 border rounded-md disabled:opacity-50 transition duration-300"
        >
          Previous
        </button>
        <button 
          v-for="page in displayedPages" 
          :key="page" 
          @click="goToPage(page)" 
          :class="['px-3 py-1 border rounded-md transition duration-300', currentPage === page ? 'bg-blue-500 text-white' : '']"
        >
          {{ page }}
        </button>
        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages" 
          class="px-3 py-1 border rounded-md disabled:opacity-50 transition duration-300"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4">
          {{ currentBatch.id ? 'Edit Batch' : 'Add New Batch' }}
        </h2>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Item</label>
            <select 
              v-model="currentBatch.inventory_item_id"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select an item</option>
              <option v-for="item in inventoryItems" :key="item.id" :value="item.id">
                {{ item.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Quantity</label>
            <input 
              v-model="currentBatch.quantity"
              type="number"
              min="0"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Expiry Date</label>
            <input 
              v-model="currentBatch.expiry_date"
              type="date"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Supplier</label>
            <input 
              v-model="currentBatch.supplier"
              type="text"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Received Date</label>
            <input 
              v-model="currentBatch.received_date"
              type="date"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div class="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Saving...' : (currentBatch.id ? 'Update' : 'Save') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Dispose Confirmation Modal -->
    <div v-if="showDisposeModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4">Confirm Dispose</h2>
        <p>Are you sure you want to dispose of this batch? This action will reduce the inventory quantity and cannot be undone.</p>
        <div class="flex justify-end space-x-2 mt-6">
          <button
            @click="showDisposeModal = false"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-300"
          >
            Cancel
          </button>
          <button
            @click="handleDispose"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300"
            :disabled="isDisposing"
          >
            {{ isDisposing ? 'Disposing...' : 'Dispose' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import axios from 'axios'
import { PlusIcon, PencilIcon, ArchiveIcon } from 'lucide-vue-next'
import Swal from 'sweetalert2'

const API_URL = 'http://localhost:5000/api/inventory'

const batches = ref([])
const inventoryItems = ref([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDisposeModal = ref(false)
const isSubmitting = ref(false)
const isDisposing = ref(false)
const selectedBatchId = ref(null)

const tableHeaders = ['Batch Number', 'Item', 'Quantity', 'Expiry Date', 'Supplier', 'Received Date', 'Status']

const filters = ref({
  search: '',
  item: '',
  status: ''
})

const currentBatch = ref({
  id: null,
  inventory_item_id: '',
  batch_number: '',
  quantity: 0,
  expiry_date: '',
  supplier: '',
  received_date: ''
})

// Pagination
const itemsPerPage = 10
const currentPage = ref(1)

const fetchBatches = async () => {
  try {
    const response = await axios.get(`${API_URL}/items`)
    batches.value = response.data.data.reduce((acc, item) => {
      return [...acc, ...(item.batches || []).map(batch => ({
        ...batch,
        inventoryItem: {
          id: item.id,
          name: item.name
        }
      }))]
    }, [])
    updateExpiredBatches()
  } catch (error) {
    console.error('Error fetching batches:', error)
    showErrorAlert('Failed to fetch batches', error.message)
  }
}

const fetchInventoryItems = async () => {
  try {
    const response = await axios.get(`${API_URL}/items`)
    inventoryItems.value = response.data.data || []
  } catch (error) {
    console.error('Error fetching inventory items:', error)
    showErrorAlert('Failed to fetch inventory items', error.message)
  }
}

const handleSubmit = async () => {
  try {
    isSubmitting.value = true
    let response
    
    if (currentBatch.value.id) {
      response = await axios.put(`${API_URL}/batches/${currentBatch.value.id}`, currentBatch.value)
    } else {
      response = await axios.post(`${API_URL}/batches`, currentBatch.value)
    }
    if (response.data.success) {
      await fetchBatches()
      closeModal()
      showSuccessAlert('Success', currentBatch.value.id ? 'Batch updated successfully' : 'New batch added successfully')
    } else {
      showErrorAlert('Error', response.data.error || 'Failed to submit batch')
    }
  } catch (error) {
    console.error('Error submitting batch:', error)
    showErrorAlert('Error', 'Failed to submit batch')
  } finally {
    isSubmitting.value = false
  }
}

const editBatch = (batch) => {
  currentBatch.value = { 
    id: batch.id,
    inventory_item_id: batch.inventoryItem?.id || '',
    batch_number: batch.batch_number,
    quantity: batch.quantity,
    expiry_date: batch.expiry_date ? new Date(batch.expiry_date).toISOString().split('T')[0] : '',
    supplier: batch.supplier,
    received_date: batch.received_date ? new Date(batch.received_date).toISOString().split('T')[0] : ''
  }
  showEditModal.value = true
}

const confirmDispose = (batch) => {
  selectedBatchId.value = batch.id
  showDisposeModal.value = true
}

const handleDispose = async () => {
  try {
    isDisposing.value = true
    const response = await axios.put(`${API_URL}/batches/${selectedBatchId.value}/dispose`)
    if (response.data.success) {
      await fetchBatches()
      showDisposeModal.value = false
      showSuccessAlert('Success', 'Batch disposed and inventory updated successfully')
    } else {
      showErrorAlert('Error', response.data.error || 'Failed to dispose batch')
    }
  } catch (error) {
    console.error('Error disposing batch:', error)
    showErrorAlert('Error', 'Failed to dispose batch')
  } finally {
    isDisposing.value = false
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  currentBatch.value = {
    id: null,
    inventory_item_id: '',
    batch_number: '',
    quantity: 0,
    expiry_date: '',
    supplier: '',
    received_date: ''
  }
}

const openAddModal = () => {
  currentBatch.value = {
    id: null,
    inventory_item_id: '',
    batch_number: '',
    quantity: 0,
    expiry_date: '',
    supplier: '',
    received_date: ''
  }
  showAddModal.value = true
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

const updateExpiredBatches = () => {
  const currentDate = new Date()
  batches.value = batches.value.map(batch => ({
    ...batch,
    isExpired: new Date(batch.expiry_date) < currentDate
  }))
}

const getBatchStatus = (batch) => {
  return batch.isExpired ? 'Expired' : 'Active'
}

const getBatchStatusClass = (batch) => {
  return batch.isExpired
    ? 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800'
    : 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'
}

const filteredBatches = computed(() => {
  return batches.value.filter(batch => {
    const matchesSearch = (batch.batch_number || '').toLowerCase().includes(filters.value.search.toLowerCase()) ||
                          (batch.supplier || '').toLowerCase().includes(filters.value.search.toLowerCase()) ||
                          (batch.inventoryItem?.name || '').toLowerCase().includes(filters.value.search.toLowerCase())
    const matchesItem = !filters.value.item || batch.inventory_item_id === filters.value.item
    const matchesStatus = !filters.value.status || 
                          (filters.value.status === 'expired' && batch.isExpired) ||
                          (filters.value.status === 'active' && !batch.isExpired)
    return matchesSearch && matchesItem && matchesStatus
  })
})

const totalPages = computed(() => Math.ceil(filteredBatches.value.length / itemsPerPage))

const paginatedBatches = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredBatches.value.slice(start, end)
})

const paginationStart = computed(() => (currentPage.value - 1) * itemsPerPage + 1)
const paginationEnd = computed(() => Math.min(currentPage.value * itemsPerPage, filteredBatches.value.length))

const displayedPages = computed(() => {
  const range = 2
  let start = Math.max(1, currentPage.value - range)
  let end = Math.min(totalPages.value, currentPage.value + range)

  if (end - start + 1 < range * 2 + 1) {
    if (start === 1) {
      end = Math.min(start + range * 2, totalPages.value)
    } else {
      start = Math.max(end - range * 2, 1)
    }
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const goToPage = (page) => {
  currentPage.value = page
}

// SweetAlert functions
const showSuccessAlert = (title, message) => {
  Swal.fire({
    icon: 'success',
    title: title,
    text: message,
    confirmButtonColor: '#3085d6',
  })
}

const showErrorAlert = (title, message) => {
  Swal.fire({
    icon: 'error',
    title: title,
    text: message,
    confirmButtonColor: '#d33',
  })
}

// Watch for filter changes
watch([() => filters.value.search, () => filters.value.item, () => filters.value.status], () => {
  currentPage.value = 1 // Reset to first page when filters change
})

onMounted(() => {
  fetchBatches()
  fetchInventoryItems()
})
</script>

<style scoped>
/* Add any additional styles here if needed */
</style>