/**
 * Vue Router Configuration
 */
import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/pages/HomePage.vue';
import OtpVerificationPage from '@/pages/OtpVerificationPage.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/verify',
      name: 'verify',
      component: OtpVerificationPage,
    },
  ],
});

export default router;