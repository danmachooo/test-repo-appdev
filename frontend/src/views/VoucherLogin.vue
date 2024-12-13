<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="w-full max-w-md bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold text-gray-800 text-center mb-6">Voucher Login</h2>
      <form @submit.prevent="handleVoucherValidation">
        <div class="mb-4">
          <label for="voucher" class="block text-sm font-medium text-gray-700">Voucher Code</label>
          <input
            v-model="voucher"
            type="text"
            id="voucher"
            class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter voucher code"
            required
          />
        </div>
        <button
          type="submit"
          class="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
        >
          Validate Voucher
        </button>
      </form>
      <p v-if="errorMessage" class="text-red-500 text-center mt-4">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const voucher = ref("");
const errorMessage = ref("");
const router = useRouter();

const handleVoucherValidation = async () => {
  try {
    const response = await axios.post("http://localhost:5000/api/auth/voucher-login", {
      voucher: voucher.value,
    });

    router.push("/set-password");
  } catch (error) {
    errorMessage.value = error.response?.data?.error || "An error occurred. Please try again.";
    console.error("Voucher validation failed:", error);
  }
};

const checkAdminStatus = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/auth/has-admins');
    if (!response.data.hasAdminWithNullPassword) {
      router.push('/');
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
  }
};

onMounted(checkAdminStatus);
</script>