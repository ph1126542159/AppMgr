// src/router.js
import { createRouter, createWebHistory } from 'vue-router';
import LoginView from './components/LoginView.vue';
import WebAppView from './components/WebAppView.vue';

const routes = [
    {
        path: '/loginPage',
        name: 'Login',
        component: LoginView
    },
    {
        path: '/launcher',
        name: 'Home',
        component: WebAppView
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
