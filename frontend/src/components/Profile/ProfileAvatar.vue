<template>
  <div class="mx-2 lg:mx-12 mb-12">
    <img :src="userAvatarUrl" alt="Фото пользователя" class="w-56 h-56 rounded mb-6 mx-auto">
    <h2 class="text-3xl font-semibold mb-3 text-center lg:text-left" style="word-break: break-word;">{{ user.username }}</h2>
    <hr v-if="!user.is_private">
    <div class="flex justify-center mt-3" v-if="!user.is_private">
      <profile-button
          :buttonName="'friend_request_button'"
          :friendsCount="$props.user.friends"
          :title="'Добавить в друзья'"
          :url="{ name: 'friendRequest', params: { username: $props.user.username } }"
      />
      <profile-button
          :buttonName="'user_chat_button'"
          :title="'Написать сообщение'"
          :url="{ name: 'userChat', params: { username: $props.user.username } }"
      />
      <profile-button
          :buttonName="'edit_profile_button'"
          :title="'Изменить профиль'"
          :url="{ name: 'editProfile', params: { username: $props.user.username } }"
      />
      <profile-button
          :buttonName="'user_parties_button'"
          :title="'Посмотреть сыгранные партии'"
          :url="{ name: 'userParties', params: { username: $props.user.username } }"
      />
    </div>
  </div>
</template>

<script>
import ProfileButton from '@/components/Profile/ProfileButton'

export default {
  props: {
    user: {
      type: Object,
      required: true,
    }
  },
  components: {
    ProfileButton
  },
  computed: {
    userAvatarUrl() {
      if (this.$props.user.is_private)
        return this.host + '/media/' + this.$props.user.avatar

      return this.host + this.$props.user.avatar
    }
  }
}
</script>