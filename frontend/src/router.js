import { createRouter, createWebHistory } from "vue-router";
import Home from "./views/account/Home.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: Home,
  },
  {
    path: "/gomoku/",
    component: () => import("./views/gomoku/Gomoku.vue"),
    name: "gomoku",
  },
  {
    path: "/gomoku/:id/",
    component: () => import("./views/gomoku/GomokuParty.vue"),
    name: "gomokuParty",
  },
  {
    path: "/chess/",
    component: () => import("./views/chess/Chess.vue"),
    name: "chess",
  },
  {
    path: "/account/",
    component: () => import("./views/account/Profile.vue"),
    name: "userProfile",
  },
  {
    path: "/account/friends/",
    component: () => import("./views/account/UsersList.vue"),
    name: "friends",
  },
  {
    path: "/account/views/",
    component: () => import("./views/account/UsersList.vue"),
    name: "viewers",
  },
  {
    path: "/account/:username/",
    name: "profile",
    component: () => import("./views/account/Profile.vue"),
  },
  {
    path: "/account/:username/views/",
    name: "usersViewers",
    component: () => import("./views/account/UsersList.vue"),
  },
  {
    path: "/account/:username/friends/",
    name: "usersFriends",
    component: () => import("./views/account/UsersList.vue"),
  },
  {
    path: "/account/:username/friend-request",
    name: "friendRequest",
    redirect: "/:username/",
  },
  {
    path: "/account/:username/chat",
    name: "userChat",
    redirect: "/:username/",
  },
  {
    path: "/account/:username/party-list/",
    name: "userPartyList",
    component: () => import("./views/account/UserPartyList.vue"),
  },
  {
    path: "/account/users/",
    name: "users",
    component: () => import("./views/account/UsersList.vue"),
  },
  {
    path: "/account/edit/",
    name: "editProfile",
    component: () => import("./views/account/EditProfile.vue"),
  },
  {
    path: "/account/party-list/",
    name: "partyList",
    component: () => import("./views/account/UserPartyList.vue"),
  },
  {
    path: "/account/google-oauth2/",
    name: "googleOAuth2",
    component: () => import("./views/account/GoogleOAuth2.vue"),
  },
  {
    path: "/account/vk-oauth2/",
    name: "vkOAuth2",
    component: () => import("./views/account/VKOAuth2.vue"),
  },
  {
    path: "/chat/",
    name: "chats",
    component: () => import("./views/chat/Chat.vue"),
  },
  {
    path: "/chat/:username/",
    name: "chat",
    component: () => import("./views/chat/Chat.vue"),
  },
  {
    path: "/:catchAll(.*)",
    component: () => import("./components/error_pages/NotFound.vue"),
  },
];

const router = new createRouter({
  history: createWebHistory(),
  routes,
});

export default router;