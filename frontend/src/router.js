import { createWebHistory, createRouter } from 'vue-router'
import Home from './views/Home.vue'

const routes = [
    {
        path: '/',
        name: 'home',
        component: Home
    },
    {
        path: '/:username/',
        name: 'profile',
        component: import('./views/Profile.vue')
    },
    {
        path: '/:username/friend_request',
        name: 'friend_request',
        redirect: '/:username/'
    },
    {
        path: '/:username/chat',
        name: 'user_chat',
        redirect: '/username/'
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