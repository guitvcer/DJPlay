<template>
  <div class="mx-2 lg:mx-12 mb-12 flex-shrink-0">
    <img :src="this.baseURL + user.avatar" alt="Фото пользователя" class="w-56 h-56 rounded mb-6 mx-auto">
    <h2
      class="text-3xl font-semibold mb-3 text-center lg:text-left select-text"
      style="word-break: break-word"
    >{{ user.username }}</h2>
    <hr v-if="profileViewAccess">
    <div class="flex justify-center mt-3">
      <profile-button
        buttonName="friendsButton"
        title="Друзья"
        :friendsCount="user['friends']"
        :url="{ name: 'friends' }"
        v-if="user['isMe']"
      />
      <profile-button
        buttonName="friendRequestButton"
        type="button"
        :friendRequest="user.friendRequest"
        :friendsCount="user['friends']"
        @click="friendRequest"
        v-else
      />
      <profile-button
        buttonName="userChatButton"
        title="Написать сообщение"
        :url="{ name: 'chat', params: { username: user.username } }"
        v-if="profileViewAccess && !user['isMe'] && currentUsername !== 'Гость'"
      />
      <profile-button
        buttonName="userChatButton"
        title="Написать сообщение"
        type="button"
        @click="updateModalAction('authorization'); updateOpenModal(true)"
        v-else-if="profileViewAccess && !user['isMe'] && currentUsername === 'Гость'"
      />
      <profile-button
        buttonName="editProfileButton"
        title="Изменить профиль"
        :url="{ name: 'editProfile', params: { username: user.username } }"
        v-if="user['isMe']"
      />
      <profile-button
        buttonName="userPartyListButton"
        title="Посмотреть сыгранные партии"
        :url="{ name: 'userPartyList', params: { username: user.username } }"
        v-if="profileViewAccess && $route.params.username"
      />
      <profile-button
        buttonName="userPartyListButton"
        title="Посмотреть сыгранные партии"
        :url="{ name: 'partyList' }"
        v-else-if="user['isMe']"
      />
    </div>
  </div>
</template>

<script>
import { mapMutations } from "vuex";
import store from "../../store/index";
import api from "../../api/index";
import ProfileButton from "./ProfileButton.vue";
import { isAuthenticated } from "../../utilities";

export default {
  props: {
    user: {
      type: Object,
      required: true,
    },
    profileViewAccess: {
      type: Boolean,
      required: true,
    },
  },
  components: { ProfileButton },
  computed: {
    currentUsername() {
      return store.getters.user.username;
    }
  },
  methods: {
    ...mapMutations(["createAlert", "updateOpenModal", "updateModalAction"]),
    async friendRequest() {
      if (await isAuthenticated()) {
        await api.account.sendFriendRequest(window.location.pathname + "friend-request");
        this.$emit("load-profile");
      } else {
        this.updateModalAction("authorization");
        this.updateOpenModal(true);
      }
    },
  }
}
</script>