<template>
  <div class="mx-2 lg:mx-12 mb-12">
    <img :src="userAvatarUrl" alt="Фото пользователя" class="w-56 h-56 rounded mb-6 mx-auto">
    <h2 class="text-3xl font-semibold mb-3 text-center lg:text-left" style="word-break: break-word;">{{ user.username }}</h2>
    <hr>
    <div class="flex justify-center mt-3">
      <profile-button
          :buttonName="'friend_request_button'"
          :friendsCount="$props.user.friends"
          :title="'Добавить в друзья'"
          :url="{ name: 'friend_request', params: { username: $props.user.username } }"
      />
      <profile-button
          :buttonName="'user_chat_button'"
          :title="'Написать сообщение'"
          :url="{ name: 'user_chat', params: { username: $props.user.username } }"
      />
      <profile-button
          :buttonName="'edit_profile_button'"
          :title="'Изменить профиль'"
          :url="{ name: 'edit_profile', params: { username: $props.user.username } }"
      />
      <profile-button
          :buttonName="'user_parties_button'"
          :title="'Посмотреть сыгранные партии'"
          :url="{ name: 'user_parties', params: { username: $props.user.username } }"
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
      return this.host + this.$props.user.avatar
    }
  }
}
</script>