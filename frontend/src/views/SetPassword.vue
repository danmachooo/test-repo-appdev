<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-bold text-gray-800 text-center mb-6">Set Your Password</h2>
        <form @submit.prevent="handleSetPassword">
          <div class="mb-4">
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input
              v-model="email"
              type="email"
              id="email"
              class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your email"
              required
            />
          </div>
          <div class="mb-4">
            <label for="password" class="block text-sm font-medium text-gray-700">New Password</label>
            <input
              v-model="password"
              type="password"
              id="password"
              class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter new password"
              required
            />
          </div>
          <button
            type="submit"
            class="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
          >
            Set Password
          </button>
        </form>
        <p v-if="errorMessage" class="text-red-500 text-center mt-4">{{ errorMessage }}</p>
        <p v-if="successMessage" class="text-green-500 text-center mt-4">{{ successMessage }}</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from "vue";
  import { useRouter } from "vue-router";
  import axios from "axios";
  
  const email = ref("");
  const password = ref("");
  const errorMessage = ref("");
  const successMessage = ref("");
  const router = useRouter();
  
  const handleSetPassword = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/set-password", {
        email: email.value,
        password: password.value,
      });
  
      successMessage.value = "Password set successfully. Redirecting to login...";
      setTimeout(() => router.push("/"), 2000);
    } catch (error) {
      errorMessage.value = error.response?.data?.error || "Failed to set password.";
      console.error("Setting password failed:", error);
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