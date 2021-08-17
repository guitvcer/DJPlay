<template>
  <div class="mx-2 lg:mx-12 mb-12 flex-shrink-0">
    <img :src="host + user.avatar" alt="Фото пользователя" class="w-56 h-56 rounded mb-6 mx-auto">
    <h2 class="text-3xl font-semibold mb-3 text-center lg:text-left select-text" style="word-break: break-word;">{{ user.username }}</h2>
    <hr v-if="profileViewAccess">
    <div class="flex justify-center mt-3">
      <profile-button
          buttonName="friend_request_button"
          title="Друзья"
          :friendsCount="$props.user.friends"
          :url="{ name: 'friends' }"
          v-if="$props.user.is_me"
      />
      <profile-button
          buttonName="friend_request_button"
          type="button"
          :friendRequest="$props.user.friend_request"
          :friendsCount="$props.user.friends"
          @click="friendRequest"
          v-else
      />
      <profile-button
          buttonName="user_chat_button"
          title="Написать сообщение"
          :url="{ name: 'userChat', params: { username: $props.user.username } }"
          v-if="profileViewAccess"
      />
      <profile-button
          buttonName="edit_profile_button"
          title="Изменить профиль"
          :url="{ name: 'editProfile', params: { username: $props.user.username } }"
          v-if="$props.user.is_me"
      />
      <profile-button
          buttonName="user_parties_button"
          title="Посмотреть сыгранные партии"
          :url="{ name: 'userParties', params: { username: $props.user.username } }"
          v-if="profileViewAccess"
      />
    </div>

    <modal
      action="authorization"
      :open="open"
      v-if="showAuthorizationModal"
      @close-modal="closeModal"
      @create-alert="createAlert"
      @load-user="$emit('load-user')"
    />
  </div>
</template>

<script>
import { ref } from 'vue'
import axios from 'axios'
import Modal from '@/components/Modal'
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
    friendRequest() {
      if (this.isAuthenticated()) {
        axios
          .get(this.host + window.location.pathname + 'friend_request')
          .then(response => {
            this.$emit('create-alert', {
              title: response.data.title,
              level: 'success'
            })
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
    },
    createAlert(alert) {
      this.$emit('create-alert', alert)
    }
  }
}
</script>