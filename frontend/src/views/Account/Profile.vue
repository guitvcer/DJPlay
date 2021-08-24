<template>
  <section
    :class="[
        !loading ? 'bg-gray-50 dark:bg-main-dark ' : 'flex justify-center ',
        'block lg:flex justify-around mx-auto px-0 lg:px-12 py-16 mt-8'
    ]"
    style="max-width: 1400px"
  >
    <loading v-if="loading" />
    <profile-avatar
        :user="user"
        :profileViewAccess="profileViewAccess"
        v-if="!loading"
        @create-alert="createAlert"
        @load-profile="setUserProfileInfo"
    />
    <profile-table v-if="profileViewAccess && !loading" :user="user" :extraText="extraText" />
    <profile-table v-else-if="!loading" :extraText="extraText" />
  </section>
</template>

<script>
import axios from 'axios'
import ProfileAvatar from '@/components/Profile/ProfileAvatar'
import ProfileTable from '@/components/Profile/ProfileTable'
import Loading from '@/components/Interface/Loading'

export default {
  components: {
    ProfileAvatar, ProfileTable, Loading
  },
  data() {
    return {
      user: {},
      loading: true,
      profileViewAccess: false,
      extraText: ''
    }
  },
  methods: {
    async setUserProfileInfo() {
      let url = this.host + '/account/'

      if (this.$route.params.username)
        url += this.$route.params.username

      await axios
        .get(url)
        .then(async response => {
          const viewer = await this.getUserInfo()
          this.user = response.data

          document.title = `${this.user.username} - Профиль`

          if (this.user.username === viewer.username) {
            if (this.user.is_private)
              this.extraText = 'Ваш аккаунт приватный, другие пользователи (кроме друзей) не смогут увидеть информацию о Вас.'
            this.profileViewAccess = true
          } else if (this.user.is_private) {
            if (this.user.friend_request === 'accepted') this.profileViewAccess = true
            else {
              this.extraText = 'Приватный аккаунт. Информация скрыта.'
              this.profileViewAccess = false
            }
          } else this.profileViewAccess = true

          this.loading = false
        })
        .catch(error => {
          this.$emit('api-error', error)
        })
    },
    createAlert(alert) {
      this.$emit('create-alert', alert)
    }
  },
  mounted() {
    this.setUserProfileInfo()
  }
}
</script>