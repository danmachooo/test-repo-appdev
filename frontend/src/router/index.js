import { createRouter, createWebHistory } from 'vue-router';
import Swal from 'sweetalert2';
import Dashboard from '@/views/Dashboard.vue';
import Inventory from '@/views/Inventory.vue';
import BatchManagement from '@/views/BatchManagement.vue';
import Transactions from '@/views/Transactions.vue';
import Reports from '@/views/Reports.vue';
import Settings from '@/views/Settings.vue';
import Notifications from '@/views/Notifications.vue';
import VoucherLogin from '@/views/VoucherLogin.vue';
import SetPassword from '@/views/SetPassword.vue';
import Login from '@/views/Login.vue';
import Chatbot from '@/views/ChatbotView.vue';

const routes = [
  { path: '/', component: Login },
  { path: '/voucher-login', component: VoucherLogin },
  { path: '/set-password', component: SetPassword },
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/inventory', component: Inventory, meta: { requiresAuth: true } },
  { path: '/batch-management', component: BatchManagement, meta: { requiresAuth: true } },
  { path: '/batch-management/:id', component: BatchManagement, meta: { requiresAuth: true } },
  { path: '/transactions', component: Transactions, meta: { requiresAuth: true } },
  { path: '/reports', component: Reports, meta: { requiresAuth: true } },
  { path: '/settings', component: Settings, meta: { requiresAuth: true } },
  { path: '/notifications', component: Notifications, meta: { requiresAuth: true } },
  { path: '/chatbot', component: Chatbot, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('authToken'); // Check if auth token exists

  if (to.meta.requiresAuth && !isAuthenticated) {
    Swal.fire({
      icon: 'warning',
      title: 'Access Denied',
      text: 'You must log in to access this page.',
      confirmButtonText: 'Go to Login',
    }).then(() => {
      next('/'); // Redirect to the login page after SweetAlert is dismissed
    });
  } else {
    next(); // Proceed to the requested route
  }
});

export default router;
