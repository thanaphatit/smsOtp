/**
 * Application Entry Point
 */
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './style.css';

const app = createApp(App);

// Install Pinia state management
app.use(createPinia());

// Install Vue Router
app.use(router);

app.mount('#app');