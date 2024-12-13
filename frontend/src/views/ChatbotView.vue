<template>
    <div class="flex flex-col h-full bg-white rounded-lg shadow-lg">
      <div class="bg-gray-800 text-white p-4 rounded-t-lg">
        <h2 class="text-xl font-semibold">Clinic Inventory Chatbot</h2>
      </div>
      <div class="flex-1 overflow-y-auto p-4 space-y-4" ref="chatContainer">
        <div v-for="(message, index) in messages" :key="index" 
             :class="[
               'max-w-[70%] rounded-lg p-3 mb-2',
               message.isUser ? 'ml-auto bg-indigo-100 text-indigo-800' : 'mr-auto bg-gray-100 text-gray-800'
             ]">
          {{ message.text }}
        </div>
      </div>
      <div class="border-t border-gray-200 p-4">
        <form @submit.prevent="sendMessage" class="flex space-x-2">
          <input 
            v-model="userInput" 
            type="text" 
            placeholder="Type your message here..." 
            class="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
          <button 
            type="submit" 
            class="bg-indigo-500 text-white rounded-full p-2 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Send class="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, nextTick } from 'vue';
  import { Send } from 'lucide-vue-next';
  import axios from 'axios';
  
  const messages = ref([
    { text: "Hello! How can I assist you with the clinic inventory today?", isUser: false },
  ]);
  const userInput = ref('');
  const chatContainer = ref(null);
  
  const sendMessage = async () => {
    if (userInput.value.trim() === '') return;
  
    // Add user message
    messages.value.push({ text: userInput.value, isUser: true });
    const userMessage = userInput.value;
    userInput.value = '';
  
    // Scroll to bottom
    await nextTick();
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  
    try {
      // Send user message to the API
      const response = await axios.post('http://localhost:5000/api/chat/', { message: userMessage });
      
      // Add chatbot response
      messages.value.push({ text: response.data.response, isUser: false });
      console.log("MESSAGES:", messages.value);
      
    } catch (error) {
      console.error('Error sending message:', error);
      messages.value.push({ text: 'Sorry, there was an error processing your request.', isUser: false });
    }
  
    // Scroll to bottom after receiving response
    await nextTick();
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  };
  
  onMounted(() => {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  });
  </script>
  
  <style scoped>
  
  </style>
  