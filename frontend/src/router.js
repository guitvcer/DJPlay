import { createWebHistory, createRouter } from 'vue-router'
import Home from './views/Home.vue'

const routes = [
    {
        path: '/',
        name: 'home',
        component: Home
    },
    {
        path: '/gomoku/',
        component: import('./views/Game.vue'),
        name: 'gomoku'
    },
    {
        path: '/chess/',
        component: import('./views/Game.vue'),
        name: 'chess'
    },
    {
        path: '/account/:username/',
        name: 'profile',
        component: import('./views/Profile.vue')
    },
    {
        path: '/account/:username/views/',
        name: 'usersViewers',
        component: import('./views/UsersList.vue')
    },
    {
        path: '/account/:username/friends/',
        name: 'usersFriends',
        component: import('./views/UsersList.vue')
    },
    {
        path: '/account/:username/friend_request',
        name: 'friendRequest',
        redirect: '/:username/'
    },
    {
        path: '/account/:username/chat',
        name: 'userChat',
        redirect: '/:username/'
    },
    {
        path: '/account/:username/parties/',
        name: 'userParties',
        redirect: '/'
    },
    {
        path: '/account/users/',
        name: 'users',
        component: import('./views/UsersList.vue')
    },
    {
        path: '/account/edit/',
        name: 'editProfile',
        component: import('./views/EditProfile.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router