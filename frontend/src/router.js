import { createWebHistory, createRouter } from 'vue-router'
import Home from './views/Home.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/gomoku/',
        name: 'gomoku',
        redirect: '/'
    },
    {
        path: '/chess/',
        name: 'chess',
        redirect: '/'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router