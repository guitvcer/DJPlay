<template>
  <div class="mx-2 lg:mx-12 mb-12">
    <img :src="userAvatarUrl" alt="Фото пользователя" class="w-56 h-56 rounded mb-6 mx-auto">
    <h2 class="text-3xl font-semibold mb-3 text-center lg:text-left" style="word-break: break-word;">{{ user.username }}</h2>
    <hr>
    <div class="flex justify-center mt-3">
      <profile-button :buttonName="'friend_request_button'" :friendsCount="user.friends" :title="'Добавить в друзья'" />
      <profile-button :buttonName="'user_chat_button'" :title="'Написать сообщение'" />
      <profile-button :buttonName="'edit_profile_button'" :title="'Изменить профиль'" />
      <profile-button :buttonName="'user_parties_button'" :title="'Посмотреть сыгранные партии'" />
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
      return this.host + '/media/' + this.user.avatar
    }
  }
}
</script>