<template>
    <router-link :to="to" class="flex items-center mt-4 py-2 px-6 text-white hover:bg-indigo-600 hover:bg-opacity-25 hover:text-gray-100 rounded-lg transition-colors duration-200">
      <component :is="icon" class="h-5 w-5" />
      <span class="mx-3"><slot></slot></span>
    </router-link>
  </template>
  
  <script setup>
  import { defineProps } from 'vue'
  import * as LucideIcons from 'lucide-vue-next'
  
  const props = defineProps({
    icon: {
      type: String,
      required: true
    },
    to: {
      type: String,
      required: true
    }
  })
  
  const icon = LucideIcons[props.icon]
  </script>