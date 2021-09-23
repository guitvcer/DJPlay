<template>
  <div class="mx-2 lg:mx-12 mb-12 flex-shrink-0 flex flex-col justify-center">
    <avatar-input
      class="w-56 h-56 rounded mb-6 mx-auto"
      :default-src="host + '/media/avatars/user.png'"
      :avatar="host + user.avatar"
    />
    <h2
      class="text-3xl font-semibold mb-3 text-center lg:text-left select-text"
      style="word-break: break-word"
    >{{ user.username }}</h2>
    <hr>
    <div class="flex justify-center mt-3">
      <profile-button
        buttonName="userProfileEditSave"
        title="Сохранить"
        type="submit"
      />
      <profile-button
        buttonName="userProfileEditCancel"
        title="Отменить"
        :url="{ name: 'profile', params: { username: $props.user.username } }"
      />
      <profile-button
        buttonName="userProfileEditChangePassword"
        title="Сменить пароль"
        type="button"
        @click="showChangePasswordModal = true"
      />
      <profile-button
        buttonName="userProfileEditDelete"
        title="Удалить аккаунт"
        type="button"
        @click="showDeleteProfileModal = true"
      />
    </div>
    <modal
      action="changePassword"
      v-if="showChangePasswordModal"
      @close-modal="showChangePasswordModal = false"
      @create-alert="createAlert"
      @load-user="$emit('load-user')"
    />
    <modal
      action="deleteProfile"
      v-if="showDeleteProfileModal"
      @close-modal="showDeleteProfileModal = false"
      @create-alert="createAlert"
      @load-user="$emit('load-user')"
    />
  </div>
</template>

<script>
import AvatarInput from '@/components/EditProfile/AvatarInput'
import Modal from '@/components/Interface/Modal'
import ProfileButton from '@/components/Profile/ProfileButton'

export default {
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      avatar: null,
      showChangePasswordModal: false,
      showDeleteProfileModal: false
    }
  },
  components: {
    AvatarInput, Modal, ProfileButton
  },
  methods: {
    createAlert(alert) {
      this.$emit('create-alert', alert)
    }
  }
}
</script>