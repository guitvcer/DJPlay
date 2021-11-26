<template>
  <div class="mx-2 lg:mx-12 mb-12 flex-shrink-0">
    <img :src="host + user.avatar" alt="Фото пользователя" class="w-56 h-56 rounded mb-6 mx-auto">
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
        v-if="profileViewAccess && !user['isMe']"
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

    <modal
      action="authorization"
      :open="open"
      v-if="showAuthorizationModal"
      @close-modal="closeModal"
      @load-user="$emit('load-user')"
    />
  </div>
</template>

<script>
import { mapMutations } from "vuex";
import { ref } from 'vue'
import axios from 'axios'
import Modal from '@/components/Interface/Modal'
import ProfileButton from '@/components/Profile/ProfileButton'

export default {
  props: {
    user: {
      type: Object,
      required: true
    },
    profileViewAccess: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      open: ref(false),
      showAuthorizationModal: false
    }
  },
  components: {
    Modal, ProfileButton
  },
  methods: {
    ...mapMutations(["createAlert"]),
    async friendRequest() {
      if (this.isAuthenticated()) {
        await axios
          .get(this.host + '/api' + window.location.pathname + 'friend-request')
          .then(response => {
            this.createAlert({
              title: response.data.title,
              level: "success",
            });
            this.$emit('load-profile')
          })
          .catch(error => this.$emit('api-error', error))
      } else {
        this.open = true
        this.showAuthorizationModal = true
      }
    },
    closeModal() {
      this.showAuthorizationModal = false
      this.showRegistrationModal = false
    }
  }
}
</script>