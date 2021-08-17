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
        component: import('./views/Gomoku.vue'),
        name: 'gomoku'
    },
    {
        path: '/chess/',
        component: import('./views/Chess.vue'),
        name: 'chess'
    },
    {
        path: '/account/',
        component: import('./views/Profile'),
        name: 'userProfile'
    },
    {
        path: '/account/friends/',
        component: import('./views/UsersList'),
        name: 'friends'
    },
    {
        path: '/account/views/',
        component: import('./views/UsersList'),
        name: 'viewers'
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
    },
    {
        path: '/:catchAll(.*)',
        component: import('./components/ErrorPages/NotFound')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router