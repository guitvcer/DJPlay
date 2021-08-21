import { createWebHistory, createRouter } from 'vue-router'
import Home from './views/Account/Home.vue'

const routes = [
    {
        path: '/',
        name: 'home',
        component: Home
    },
    {
        path: '/gomoku/',
        component: import('./views/Gomoku/Gomoku.vue'),
        name: 'gomoku'
    },
    {
        path: '/gomoku/:id/',
        component: import('./views/Gomoku/GomokuParty'),
        name: 'gomokuParty'
    },
    {
        path: '/account/',
        component: import('./views/Account/Profile'),
        name: 'userProfile'
    },
    {
        path: '/account/friends/',
        component: import('./views/Account/UsersList'),
        name: 'friends'
    },
    {
        path: '/account/views/',
        component: import('./views/Account/UsersList'),
        name: 'viewers'
    },
    {
        path: '/account/:username/',
        name: 'profile',
        component: import('./views/Account/Profile.vue')
    },
    {
        path: '/account/:username/views/',
        name: 'usersViewers',
        component: import('./views/Account/UsersList.vue')
    },
    {
        path: '/account/:username/friends/',
        name: 'usersFriends',
        component: import('./views/Account/UsersList.vue')
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
        path: '/account/:username/party-list/',
        name: 'userPartyList',
        component: import('./views/Account/UserPartyList.vue')
    },
    {
        path: '/account/users/',
        name: 'users',
        component: import('./views/Account/UsersList.vue')
    },
    {
        path: '/account/edit/',
        name: 'editProfile',
        component: import('./views/Account/EditProfile.vue')
    },
    {
        path: '/account/party-list/',
        name: 'partyList',
        component: import('./views/Account/UserPartyList')
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