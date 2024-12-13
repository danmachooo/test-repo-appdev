<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Transactions / Audit Log</h1>
    <p class="text-gray-600 mb-8">View and manage all transactions and audit logs related to inventory changes.</p>
    
    <!-- Filters -->
    <div class="bg-white shadow rounded-lg p-6 mb-8">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Filters</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label for="transactionType" class="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
          <select
            id="transactionType"
            v-model="filters.transactionType"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="">All Types</option>
            <option value="ADD">Add</option>
            <option value="REMOVE">Remove</option>
            <option value="UPDATE">Update</option>
            <option value="DISPOSE">Dispose</option>
          </select>
        </div>
        <div>
          <label for="dateRange" class="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
          <input
            id="dateRange"
            v-model="filters.dateRange"
            type="date"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
        </div>
        <div>
          <label for="search" class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            id="search"
            v-model="filters.search"
            type="text"
            placeholder="Search by item or batch..."
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
        </div>
      </div>
    </div>

    <!-- Transactions Table -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th v-for="header in tableHeaders" :key="header" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ header }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="transaction in paginatedTransactions" :key="transaction.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(transaction.date) }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getTransactionTypeClass(transaction.transaction_type)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                {{ transaction.transaction_type }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ transaction.InventoryItem?.name || 'N/A' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ transaction.Batch?.batch_number || 'N/A' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span :class="getQuantityChangeClass(transaction.quantity_change)">
                {{ formatQuantityChange(transaction.quantity_change) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ transaction.previous_quantity }} → {{ transaction.updated_quantity }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ transaction.remarks }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="mt-6 flex justify-between items-center">
      <button
        @click="prevPage"
        :disabled="currentPage === 1"
        class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <span class="text-sm text-gray-700">
        Page {{ currentPage }} of {{ totalPages }}
      </span>
      <button
        @click="nextPage"
        :disabled="currentPage === totalPages"
        class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';

const transactions = ref([]);
const currentPage = ref(1);
const itemsPerPage = 10;
const totalItems = ref(0);

const filters = ref({
  transactionType: '',
  dateRange: '',
  search: '',
});

const API_URL = 'http://localhost:5000/api/inventory';

const tableHeaders = [
  'Date',
  'Type',
  'Item',
  'Batch',
  'Quantity Change',
  'Quantity Before → After',
  'Remarks'
];

const fetchTransactions = async () => {
  try {
    const response = await axios.get(`${API_URL}/transactions`, {
      params: {
        page: currentPage.value,
        limit: itemsPerPage,
        ...filters.value,
      },
    });
    
    const processedTransactions = processTransactions(response.data.data);
    transactions.value = processedTransactions;
    totalItems.value = response.data.total;
  } catch (error) {
    console.error('Error fetching transactions:', error);
  }
};

const processTransactions = (rawTransactions) => {
  const itemQuantities = {};
  return rawTransactions.map(transaction => {
    const itemId = transaction.inventory_item_id;
    if (!itemQuantities[itemId]) {
      itemQuantities[itemId] = transaction.InventoryItem.quantity_in_stock;
    }

    const updatedQuantity = itemQuantities[itemId];
    let previousQuantity;

    switch (transaction.transaction_type) {
      case 'ADD':
        previousQuantity = updatedQuantity - transaction.quantity_change;
        break;
      case 'REMOVE':
      case 'DISPOSE':
        previousQuantity = updatedQuantity + Math.abs(transaction.quantity_change);
        break;
      case 'UPDATE':
        previousQuantity = updatedQuantity - transaction.quantity_change;
        break;
      default:
        previousQuantity = updatedQuantity;
    }

    itemQuantities[itemId] = previousQuantity;

    return {
      ...transaction,
      previous_quantity: previousQuantity,
      updated_quantity: updatedQuantity
    };
  }).reverse(); // Reverse to show most recent transactions first
};

onMounted(fetchTransactions);

const filteredTransactions = computed(() => {
  return transactions.value.filter(transaction => {
    const matchesType = !filters.value.transactionType || transaction.transaction_type === filters.value.transactionType;
    const matchesDate = !filters.value.dateRange || new Date(transaction.date).toDateString() === new Date(filters.value.dateRange).toDateString();
    const matchesSearch = !filters.value.search || 
      transaction.InventoryItem?.name.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      (transaction.Batch?.batch_number && transaction.Batch.batch_number.toLowerCase().includes(filters.value.search.toLowerCase()));
    return matchesType && matchesDate && matchesSearch;
  });
});

const totalPages = computed(() => Math.ceil(filteredTransactions.value.length / itemsPerPage));

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredTransactions.value.slice(start, end);
});

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString();
};

const getTransactionTypeClass = (type) => {
  switch (type) {
    case 'ADD':
      return 'bg-green-100 text-green-800';
    case 'REMOVE':
      return 'bg-red-100 text-red-800';
    case 'UPDATE':
      return 'bg-yellow-100 text-yellow-800';
    case 'DISPOSE':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
};

const getQuantityChangeClass = (change) => {
  return change > 0 ? 'text-green-600' : 'text-red-600';
};

const formatQuantityChange = (change) => {
  return change > 0 ? `+${change}` : change;
};

watch([() => filters.value.transactionType, () => filters.value.dateRange, () => filters.value.search], () => {
  currentPage.value = 1;
  fetchTransactions();
});
</script>