<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-bold text-gray-800 text-center mb-6">Inventory System Login</h2>
        <form @submit.prevent="handleLogin">
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
            Login
          </button>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from "vue";
  import { useRouter } from "vue-router";
  
  const voucher = ref("");
  const router = useRouter();
  
  const handleLogin = async () => {
    try {
      const response = await fetch("http:localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voucher: voucher.value }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        localStorage.setItem("authToken", data.token);
        router.push("/dashboard"); // Redirect to the dashboard
      } else {
        alert(data.message || "Invalid voucher code");
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("An error occurred. Please try again.");
    }
  };
  </script>
  
  <style>
  /* Optional: Add custom styles if needed */
  </style>
  