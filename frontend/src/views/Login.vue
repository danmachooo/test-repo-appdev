<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-bold text-gray-800 text-center mb-6">Admin Login</h2>
        <form @submit.prevent="handleLogin">
          <div class="mb-4">
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input
              v-model="email"
              type="email"
              id="email"
              class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Enter your email"
              required
            />
          </div>
          <div class="mb-4">
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <input
              v-model="password"
              type="password"
              id="password"
              class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            class="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '@/store/authStore';
  import Swal from 'sweetalert2';
  import axios from 'axios';
  
  const email = ref('');
  const password = ref('');
  const router = useRouter();
  const authStore = useAuthStore();
  
  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: email.value,
        password: password.value,
      });
  
      authStore.login(response.data.token);
      await Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: 'Welcome back!',
        timer: 1500,
        showConfirmButton: false,
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: error.response?.data?.error || 'An error occurred. Please try again.',
      });
    }
  };
  
  const checkAdminStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/has-admins');
      if (response.data.hasAdminWithNullPassword) {
        router.push('/voucher-login');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };
  
  onMounted(checkAdminStatus);
  </script>