<template>
  <aside :class="[
    'bg-green-950 text-white w-64 flex-shrink-0 overflow-y-auto transition-all duration-300 ease-in-out',
    { '-ml-64': !isOpen }
  ]">
    <div class="p-4">
      <div class="flex items-center space-x-2 mb-6">
        <img src="@/assets/minsu.png" alt="Logo" class="w-10 h-10" />
        <h1 class="font-bold">Clinic Inventory</h1>
      </div>
      <nav>
        <SidebarLink icon="LayoutDashboard" to="/dashboard">Dashboard</SidebarLink>
        <SidebarLink icon="MessageSquare" to="/chatbot">Chatbot</SidebarLink>
        <SidebarLink icon="Package" to="/inventory">Inventory</SidebarLink>
        <SidebarLink icon="Layers" to="/batch-management">Batch Management</SidebarLink>
        <SidebarLink icon="FileText" to="/transactions">Transactions / Audit Log</SidebarLink>
        <SidebarLink icon="BarChart2" to="/reports">Reports</SidebarLink>
        <SidebarLink icon="Settings" to="/settings">Settings</SidebarLink>
      </nav>
    </div>
    <div class="mt-auto p-4">
      <button @click="handleLogout" class="flex items-center text-white hover:text-indigo-200 transition-colors duration-200">
        <LogOut class="w-5 h-5 mr-2" />
        Logout
      </button>
    </div>
  </aside>
</template>

<script setup>
import { defineProps } from 'vue'
import { useRouter } from 'vue-router'
import { LogOut, MessageSquare } from 'lucide-vue-next'
import SidebarLink from './SidebarLink.vue'
import { useAuthStore } from '@/store/authStore'
import Swal from 'sweetalert2'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
})

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "You will be logged out of the system.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, log out!'
  })

  if (result.isConfirmed) {
    await Swal.fire({
      icon: 'success',
      title: 'Logged Out',
      text: 'You have been successfully logged out.',
      timer: 1500,
      showConfirmButton: false
    })
    authStore.logout()
    router.push('/')
  }
}
</script>