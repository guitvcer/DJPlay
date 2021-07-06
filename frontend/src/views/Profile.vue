<template>
  <section class="bg-gray-50 dark:bg-main-dark block lg:flex justify-around mx-auto px-0 lg:px-12 py-16 mt-8" style="max-width: 1400px;">
    <profile-avatar :user="user" />
    <profile-table :user="user" />
  </section>
</template>

<script>
import ProfileAvatar from '@/components/Profile/ProfileAvatar'
import ProfileTable from '@/components/Profile/ProfileTable'

export default {
  components: {
    ProfileAvatar, ProfileTable
  },
  data() {
    return {
      user: {
        id: 1,
        username: this.$route.params.username,
        firstName: 'firstName',
        lastName: 'lastName',
        email: this.$route.params.username + '@example.com',
        date_joined: new Date().toString(),
        avatar: 'user.png',
        birthday: new Date().toString(),
        gender: 'Мужской',
        last_online: '2 часа назад',
        friends: 23,
        views: 256,
        is_active: true,
        is_online: false,
        is_private: false
      }
    }
  }
}
</script>