<template>
    <div class="w-full md:w-1/2 xl:w-1/3 px-6 py-2">
      <div class="flex items-center px-5 py-6 shadow-sm rounded-md bg-white">
        <div class="p-3 rounded-full" :class="color">
          <component :is="icon" class="h-8 w-8 text-white" />
        </div>
        <div class="mx-5">
          <h4 class="text-2xl font-semibold text-gray-700">{{ value.toLocaleString() }}</h4>
          <div class="text-gray-500">{{ title }}</div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps } from 'vue'
  import * as LucideIcons from 'lucide-vue-next'
  
  const props = defineProps({
    title: String,
    value: Number,
    icon: String,
    color: String
  })
  
  const icon = LucideIcons[props.icon]
  </script>