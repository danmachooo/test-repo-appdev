<template>
  <div class="min-h-screen bg-gray-100">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Inventory Management</h1>
      <p class="text-gray-600 mb-8">Manage your inventory items, track stock levels, and maintain product information.</p>
      
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div class="flex flex-col md:flex-row justify-between items-center mb-6">
          <div class="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-4 md:mb-0">
            <button @click="showAddModal = true" class="btn-primary">
              <PlusIcon class="w-5 h-5 mr-2" />
              Add Item
            </button>
            <label class="btn-secondary">
              <UploadIcon class="w-5 h-5 mr-2" />
              Upload Excel
              <input type="file" class="hidden" @change="uploadExcel" accept=".xlsx, .xls" />
            </label>
          </div>
          <div class="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
            <div class="relative">
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Search items..." 
                class="pl-10 pr-4 py-2 w-full sm:w-64 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <SearchIcon class="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            </div>
            <select 
              v-model="selectedCategory" 
              class="w-full sm:w-auto border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              @change="handleCategoryChange"
            >
              <option value="">All Categories</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
              <option value="new">+ Add New Category</option>
            </select>
          </div>
        </div>

        <!-- New Category Modal -->
        <Teleport to="body">
          <div v-if="showNewCategoryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style="z-index: 100;">
            <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <h3 class="text-xl font-bold mb-4">Add New Category</h3>
              <form @submit.prevent="submitNewCategory">
                <div class="space-y-4">
                  <div>
                    <label for="categoryName" class="block text-sm font-medium text-gray-700">Category Name</label>
                    <input 
                      type="text" 
                      id="categoryName" 
                      v-model="newCategory.name" 
                      required 
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label for="categoryDescription" class="block text-sm font-medium text-gray-700">Description</label>
                    <textarea 
                      id="categoryDescription" 
                      v-model="newCategory.description" 
                      rows="3" 
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    ></textarea>
                  </div>
                  <div class="flex justify-end space-x-3">
                    <button type="button" @click="closeNewCategoryModal" class="btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" class="btn-primary">
                      Add Category
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </Teleport>
      </div>

      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="overflow-x-auto">
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
              <tr v-for="item in filteredItems" :key="item.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">{{ item.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ item.description }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ getCategoryName(item.category_id) }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  {{ item.quantity_in_stock === 0 ? 'Out of Stock' : item.quantity_in_stock }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">{{ item.min_stock_level }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ item.reorder_level }}</td>
                <td class="px-6 py-4 whitespace-nowrap space-x-2">
                  <button @click="viewItem(item)" class="text-blue-600 hover:text-blue-900" title="View Item">
                    <EyeIcon class="w-5 h-5" />
                  </button>
                  <button @click="editItem(item)" class="text-blue-600 hover:text-blue-900" title="Edit Item">
                    <EditIcon class="w-5 h-5" />
                  </button>
                  <button @click="openReduceStockModal(item)" class="text-red-600 hover:text-red-900" title="Disburse Item">
                    <PackageOpenIcon class="w-5 h-5" />
                  </button>
                  <button @click="openHistoryModal(item)" class="text-green-600 hover:text-green-900" title="View History">
                    <HistoryIcon class="w-5 h-5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div class="mt-6 flex justify-between items-center">
        <div class="text-sm text-gray-700">
          Showing {{ paginationStart }} to {{ paginationEnd }} of {{ totalItems }} entries
        </div>
        <div class="flex space-x-2">
          <button 
            @click="prevPage" 
            :disabled="currentPage === 1" 
            class="btn-secondary px-3 py-1 disabled:opacity-50"
          >
            <ChevronLeftIcon class="w-5 h-5" />
          </button>
          <button 
            v-for="page in displayedPages" 
            :key="page" 
            @click="goToPage(page)" 
            :class="['btn-secondary px-3 py-1', currentPage === page ? 'bg-blue-600 text-white' : '']"
          >
            {{ page }}
          </button>
          <button 
            @click="nextPage" 
            :disabled="currentPage === totalPages" 
            class="btn-secondary px-3 py-1 disabled:opacity-50"
          >
            <ChevronRightIcon class="w-5 h-5" />
          </button>
        </div>
      </div>

      <div v-if="showViewModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl">
          <div class="p-6">
            <h2 class="text-2xl font-bold mb-4">View Item</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-4">
                <div>
                  <span class="font-medium text-gray-600 pr-4">Name:</span> 
                  <span class="text-gray-800">{{ currentItem.name }}</span>
                </div>
                <div>
                  <span class="font-medium text-gray-600 pr-4">Description:</span> 
                  <span class="text-gray-800">{{ currentItem.description }}</span>
                </div>
                <div>
                  <span class="font-medium text-gray-600 pr-4">Category:</span> 
                  <span class="text-gray-800">{{ getCategoryName(currentItem.category_id) }}</span>
                </div>
                <div>
                  <span class="font-medium text-gray-600 pr-4">Quantity in Stock:</span> 
                  <span class="text-gray-800">{{ currentItem.quantity_in_stock }}</span>
                </div>
                <div>
                  <span class="font-medium text-gray-600 pr-4">Min Stock Level:</span> 
                  <span class="text-gray-800">{{ currentItem.min_stock_level }}</span>
                </div>
                <div>
                  <span class="font-medium text-gray-600 pr-4">Reorder Level:</span> 
                  <span class="text-gray-800">{{ currentItem.reorder_level }}</span>
                </div>
              </div>

              <!-- New Batch Information Section -->
              <div class="space-y-4">
                <h3 class="text-lg font-semibold mb-2">Batch Information</h3>
                <div class="border border-gray-200 rounded-lg shadow-sm">
                  <div class="max-h-96 overflow-y-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                      <thead class="bg-gray-50 sticky top-0">
                        <tr>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Number</th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received Date</th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                        </tr>
                      </thead>
                      <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-for="batch in currentItem.batches" :key="batch.id" class="hover:bg-gray-50">
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ batch.batch_number }}</td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ batch.quantity }}</td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(batch.expiry_date) }}</td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(batch.received_date) }}</td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ batch.supplier }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div class="mt-6 flex justify-end">
              <button @click="closeViewModal" class="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Add/Edit Item Modal -->
      <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div class="p-6">
            <h2 class="text-2xl font-bold mb-4">{{ editingItem ? 'Edit' : 'Add New' }} Item</h2>
            <form @submit.prevent="submitItem">
              <div class="space-y-4">
                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
                  <input type="text" id="name" v-model="currentItem.name" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50">
                </div>
                <div>
                  <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                  <textarea id="description" v-model="currentItem.description" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"></textarea>
                </div>
                <div>
                  <label for="category" class="block text-sm font-medium text-gray-700">Category</label>
                  <select id="category" v-model="currentItem.category_id" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50">
                    <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
                  </select>
                </div>
                <div>
                  <label for="minStockLevel" class="block text-sm font-medium text-gray-700">Min Stock Level</label>
                  <input type="number" id="minStockLevel" v-model="currentItem.min_stock_level" required min="0" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50">
                </div>
                <div>
                  <label for="reorderLevel" class="block text-sm font-medium text-gray-700">Reorder Level</label>
                  <input type="number" id="reorderLevel" v-model="currentItem.reorder_level" required min="0" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50">
                </div>
              </div>
              <div class="mt-6 flex justify-end space-x-3">
                <button type="button" @click="closeModal" class="btn-secondary">Cancel</button>
                <button type="submit" class="btn-primary">{{ editingItem ? 'Update' : 'Add' }} Item</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div v-if="showReduceStockModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div class="p-6">
            <h2 class="text-2xl font-bold mb-4">Disburse Item</h2>
            <form @submit.prevent="reduceStock">
              <div class="space-y-4">
                <div>
                  <label for="reduceQuantity" class="block text-sm font-medium text-gray-700">Quantity to Disburse</label>
                  <input
                    type="number"
                    id="reduceQuantity"
                    v-model="reduceQuantity"
                    required
                    min="1"
                    :max="currentItem.quantity_in_stock"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label for="patientName" class="block text-sm font-medium text-gray-700">Patient Name</label>
                  <input
                    type="text"
                    id="patientName"
                    v-model="patientName"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  />
                </div>
              </div>
              <div class="mt-6 flex justify-end space-x-3">
                <button type="button" @click="closeReduceStockModal" class="btn-secondary">Cancel</button>
                <button type="submit" class="btn-primary">Disburse</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- History Modal -->
      <div v-if="showHistoryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8">
          <div class="p-6">
            <h2 class="text-2xl font-bold mb-4">Disbursement History for {{ currentItem.name }}</h2>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity Disbursed</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="transaction in paginatedHistory" :key="transaction.id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">{{ formatDate(transaction.date) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">{{ transaction.patient_name }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">{{ transaction.quantity_change }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <!-- Pagination for History -->
            <div class="mt-4 flex justify-between items-center">
              <div class="text-sm text-gray-700">
                Showing {{ historyPaginationStart }} to {{ historyPaginationEnd }} of {{ itemHistory.length }} entries
              </div>
              <div class="flex space-x-2">
                <button 
                  @click="prevHistoryPage" 
                  :disabled="historyCurrentPage === 1" 
                  class="btn-secondary px-3 py-1 disabled:opacity-50"
                >
                  <ChevronLeftIcon class="w-5 h-5" />
                </button>
                <button 
                  v-for="page in displayedHistoryPages" 
                  :key="page" 
                  @click="goToHistoryPage(page)" 
                  :class="['btn-secondary px-3 py-1', historyCurrentPage === page ? 'bg-blue-600 text-white' : '']"
                >
                  {{ page }}
                </button>
                <button 
                  @click="nextHistoryPage" 
                  :disabled="historyCurrentPage === historyTotalPages" 
                  class="btn-secondary px-3 py-1 disabled:opacity-50"
                >
                  <ChevronRightIcon class="w-5 h-5" />
                </button>
              </div>
            </div>
            <div class="mt-6 flex justify-end">
              <button @click="closeHistoryModal" class="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { PlusIcon, UploadIcon, EditIcon, SearchIcon, ChevronLeftIcon, ChevronRightIcon, EyeIcon, PackageOpenIcon, HistoryIcon } from 'lucide-vue-next'
import axios from 'axios'
import debounce from 'lodash/debounce'
import Swal from 'sweetalert2'

const API_URL = 'http://localhost:5000/api/inventory' // Replace with your actual API URL

const items = ref([])
const categories = ref([])
const tableHeaders = ['Name', 'Description', 'Category', 'Quantity in Stock', 'Min Stock Level', 'Reorder Level']

const searchQuery = ref('')
const selectedCategory = ref('')
const showAddModal = ref(false)
const showViewModal = ref(false)
const showReduceStockModal = ref(false)
const showHistoryModal = ref(false)
const showNewCategoryModal = ref(false)
const currentItem = ref({})
const reduceQuantity = ref(0)
const patientName = ref('')
const itemHistory = ref([])
const newCategory = ref({
  name: '',
  description: ''
})

const historyItemsPerPage = 10
const historyCurrentPage = ref(1)
const historyTotalPages = computed(() => Math.ceil(itemHistory.value.length / historyItemsPerPage))

const historyPaginationStart = computed(() => Math.max((historyCurrentPage.value - 1) * historyItemsPerPage + 1, 0))
const historyPaginationEnd = computed(() => Math.min(historyCurrentPage.value * historyItemsPerPage, itemHistory.value.length))

const paginatedHistory = computed(() => {
  const start = (historyCurrentPage.value - 1) * historyItemsPerPage
  const end = start + historyItemsPerPage
  return itemHistory.value.slice(start, end)
})
  
const editingItem = ref(null)

// Pagination
const itemsPerPage = 10
const currentPage = ref(1)
const totalItems = ref(0)
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

const paginationStart = computed(() => Math.max((currentPage.value - 1) * itemsPerPage + 1, 0))
const paginationEnd = computed(() => Math.min(currentPage.value * itemsPerPage, totalItems.value))

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

// Watch for category selection
watch(() => currentItem.value.category_id, (newValue) => {
  if (newValue === 'new') {
    showNewCategoryModal.value = true
    currentItem.value.category_id = '' // Reset selection
  }
})

// Add new method to handle category changes
const handleCategoryChange = (event) => {
  const value = event.target.value
  if (value === 'new') {
    showNewCategoryModal.value = true
    // Store the previous selection
    selectedCategory.value = ''
  } else {
    fetchItems()
  }
}

// Add new methods for category management
const closeNewCategoryModal = () => {
  showNewCategoryModal.value = false
  newCategory.value = {
    name: '',
    description: ''
  }
}

// Update submitNewCategory to handle both contexts
const submitNewCategory = async () => {
  try {
    const response = await axios.post(`${API_URL}/categories`, newCategory.value)
    if (response.data.success) {
      const newCat = response.data.data
      // Add the new category to the categories list
      categories.value.push(newCat)
      
      // If adding from the item modal, select the new category
      if (showAddModal.value) {
        currentItem.value.category_id = newCat.id
      }
      
      // Close the modal and reset form
      closeNewCategoryModal()
      // Fetch items to refresh the list
      fetchItems()
      showSuccessAlert('Success', 'New category added successfully')
    }
  } catch (error) {
    console.error('Error creating category:', error)
    showErrorAlert('Error', 'Failed to create new category')
  }
}

onMounted(() => {
  fetchCategories()
  fetchItems()
})

const fetchCategories = async () => {
  try {
    const response = await axios.get(`${API_URL}/categories`)
    categories.value = response.data.data
  } catch (error) {
    console.error('Error fetching categories:', error)
    showErrorAlert('Error', 'Failed to fetch categories')
  }
}

const debouncedFetchItems = debounce(() => {
  fetchItems()
}, 300)

watch(searchQuery, () => {
  debouncedFetchItems()
})

watch(selectedCategory, () => {
  fetchItems()
})

const fetchItems = async () => {
  try {
    const response = await axios.get(`${API_URL}/items`, {
      params: {
        page: currentPage.value,
        limit: itemsPerPage,
        search: searchQuery.value,
        category: selectedCategory.value
      }
    })
    if (response.data.success) {
      items.value = response.data.data || []
      totalItems.value = response.data.total_count || 0
      if (currentPage.value > totalPages.value) {
        currentPage.value = 1
      }
    } else {
      showErrorAlert('Error', 'Failed to fetch items')
    }
  } catch (error) {
    console.error('Error fetching items:', error)
    showErrorAlert('Error', 'Failed to fetch items')
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchItems()
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchItems()
  }
}

const goToPage = (page) => {
  currentPage.value = page
  fetchItems()
}

const editItem = (item) => {
  editingItem.value = item
  currentItem.value = { ...item }
  showAddModal.value = true
}

const closeModal = () => {
  showAddModal.value = false
  editingItem.value = null
  currentItem.value = {
    name: '',
    description: '',
    category_id: null,
    quantity_in_stock: 0,
    min_stock_level: 0,
    reorder_level: 0
  }
}

const submitItem = async () => {
  try {
    const itemData = {
      name: currentItem.value.name,
      description: currentItem.value.description,
      category_id: parseInt(currentItem.value.category_id),
      quantity_in_stock: parseInt(currentItem.value.quantity_in_stock),
      min_stock_level: parseInt(currentItem.value.min_stock_level),
      reorder_level: parseInt(currentItem.value.reorder_level)
    }

    if (editingItem.value) {
      await axios.put(`${API_URL}/items/${editingItem.value.id}`, itemData)
      showSuccessAlert('Success', 'Item updated successfully')
    } else {
      await axios.post(`${API_URL}/items`, itemData)
      showSuccessAlert('Success', 'Item added successfully')
    }
    closeModal()
    fetchItems()
  } catch (error) {
    console.error('Error submitting item:', error)
    showErrorAlert('Error', 'Failed to submit item')
  }
}

const uploadExcel = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  try {
    await axios.post(`${API_URL}/upload-excel`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    fetchItems()
    showSuccessAlert('Success', 'Excel file uploaded successfully')
  } catch (error) {
    console.error('Error uploading Excel file:', error)
    showErrorAlert('Error', 'Failed to upload Excel file')
  }
}

const getCategoryName = (categoryId) => {
  const category = categories.value.find(cat => cat.id === categoryId)
  return category ? category.name : 'Unknown'
}

const filteredItems = computed(() => {
  let filtered = items.value
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    )
  }
  if (selectedCategory.value) {
    filtered = filtered.filter(item => item.category_id === parseInt(selectedCategory.value))
  }
  return filtered
})

const viewItem = (item) => {
  currentItem.value = { ...item }
  showViewModal.value = true
}

const closeViewModal = () => {
  showViewModal.value = false
  currentItem.value = {}
}

const openReduceStockModal = (item) => {
  currentItem.value = { ...item }
  reduceQuantity.value = 0
  patientName.value = ''
  showReduceStockModal.value = true
}

const closeReduceStockModal = () => {
  showReduceStockModal.value = false
  currentItem.value = {}
  reduceQuantity.value = 0
  patientName.value = ''
}

const reduceStock = async () => {
  try {
    const response = await axios.post(`${API_URL}/items/${currentItem.value.id}/reduce-stock`, {
      quantity: parseInt(reduceQuantity.value),
      patientName: patientName.value
    })

    if (response.data.success) {
      showSuccessAlert('Success', 'Stock reduced successfully!')
      closeReduceStockModal()
      fetchItems()
    } else {
      showErrorAlert('Error', 'Failed to reduce stock. Please try again.')
    }
  } catch (error) {
    console.error('Error reducing stock:', error)
    showErrorAlert('Error', 'An error occurred while reducing stock.')
  }
}

const openHistoryModal = async (item) => {
  currentItem.value = { ...item }
  showHistoryModal.value = true
  historyCurrentPage.value = 1
  try {
    const response = await axios.get(`${API_URL}/items/${item.id}/history`)
    if (response.data.success) {
      itemHistory.value = response.data.data
    } else {
      showErrorAlert('Error', 'Failed to fetch item history. Please try again.')
    }
  } catch (error) {
    console.error('Error fetching item history:', error)
    showErrorAlert('Error', 'An error occurred while fetching item history.')
  }
}

const closeHistoryModal = () => {
  showHistoryModal.value = false
  currentItem.value = {}
  itemHistory.value = []
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

const displayedHistoryPages = computed(() => {
  const range = 2
  let start = Math.max(1, historyCurrentPage.value - range)
  let end = Math.min(historyTotalPages.value, historyCurrentPage.value + range)

  if (end - start + 1 < range * 2 + 1) {
    if (start === 1) {
      end = Math.min(start + range * 2, historyTotalPages.value)
    } else {
      start = Math.max(end - range * 2, 1)
    }
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

const prevHistoryPage = () => {
  if (historyCurrentPage.value > 1) {
    historyCurrentPage.value--
  }
}

const nextHistoryPage = () => {
  if (historyCurrentPage.value < historyTotalPages.value) {
    historyCurrentPage.value++
  }
}

const goToHistoryPage = (page) => {
  historyCurrentPage.value = page
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
</script>

<style scoped>
.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out flex items-center justify-center;
}

.btn-secondary {
  @apply bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition duration-300 ease-in-out flex items-center justify-center;
}

.max-h-96 {
  max-height: 24rem;
}

/* Custom scrollbar styles */
.max-h-96::-webkit-scrollbar {
  width: 8px;
}

.max-h-96::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.max-h-96::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.max-h-96::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
