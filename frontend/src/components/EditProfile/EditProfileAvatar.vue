<template>
  <div class="mx-2 lg:mx-12 mb-12 flex-shrink-0">
    <img :src="host + user.avatar" alt="Фото пользователя" class="w-56 h-56 rounded mb-6 mx-auto">
    <h2 class="text-3xl font-semibold mb-3 text-center lg:text-left select-text" style="word-break: break-word;">{{ user.username }}</h2>
    <hr>
    <div class="flex justify-center mt-3">
      <profile-button
          buttonName="user_profile_edit_save"
          title="Сохранить"
          type="submit"
      />
      <profile-button
          buttonName="user_profile_edit_cancel"
          title="Отменить"
          :url="{ name: 'profile', params: { username: $props.user.username } }"
      />
      <profile-button
          buttonName="user_profile_edit_change_password"
          title="Сменить пароль"
          url="/"
      />
      <profile-button
          buttonName="user_profile_edit_delete"
          title="Удалить аккаунт"
          url="/"
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
      required: true
    }
  },
  components: {
    ProfileButton
  }
}
</script>