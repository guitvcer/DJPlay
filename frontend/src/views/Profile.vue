<template>
  <section class="bg-gray-50 dark:bg-main-dark block lg:flex justify-around mx-auto px-0 lg:px-12 py-16 mt-8" style="max-width: 1400px;">
    <profile-avatar :user="user" v-if="!loading" />
    <profile-table :user="user" v-if="!loading && !user.is_private" />
    <p v-else-if="user.is_private" class="px-4 text-center">Приватный аккаунт. Информация скрыта.</p>
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
      user: {},
      loading: true
    }
  },
  mounted() {
    fetch(this.host + '/account/' + this.$route.params.username + '/')
      .then(response => response.json())
      .then(json => {
        this.user = json
        this.loading = false
      })
  }
}
</script>