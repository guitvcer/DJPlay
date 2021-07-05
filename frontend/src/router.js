import { createWebHistory, createRouter } from 'vue-router'
import Home from './views/Home.vue'

const routes = [
    {
        path: '/',
        name: 'home',
        component: Home
    },
    {
        path: '/account/:username/',
        name: 'profile',
        component: import('./views/Profile.vue')
    },
    {
        path: '/account/:username/friend_request',
        name: 'friend_request',
        redirect: '/:username/'
    },
    {
        path: '/account/:username/chat',
        name: 'user_chat',
        redirect: '/:username/'
    },
    {
        path: '/account/:username/parties/',
        name: 'user_parties',
        redirect: '/'
    },
    {
        path: '/account/users/',
        name: 'users',
        component: import('./views/UsersList.vue')
    },
    {
        path: '/account/edit/',
        name: 'edit_profile',
        redirect: '/'
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