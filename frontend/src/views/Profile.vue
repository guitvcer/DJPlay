<template>
  <section class="bg-gray-50 dark:bg-main-dark block lg:flex justify-around mx-auto px-0 lg:px-12 py-16 mt-8" style="max-width: 1400px;">
    <alert v-if="alerts.length" :alerts="alerts" />
    <profile-avatar :user="user" :profileViewAccess="profileViewAccess" v-if="!loading" />
    <profile-table v-if="profileViewAccess" :user="user" :extraText="extraText" />
    <profile-table v-else :extraText="extraText" />
  </section>
</template>

<script>
import Alert from '@/components/Alert'
import ProfileAvatar from '@/components/Profile/ProfileAvatar'
import ProfileTable from '@/components/Profile/ProfileTable'

export default {
  components: {
    Alert, ProfileAvatar, ProfileTable
  },
  data() {
    return {
      user: {},
      loading: true,
      profileViewAccess: false,
      extraText: '',
      alerts: []
    }
  },
  methods: {
    setUserProfileInfo() {
      let url = this.host + '/account/'

      if (this.$route.params.username)
        url += this.$route.params.username

      this.sendRequest(this.host + '/account/').then(json => {
        if (json.type === 'alert') {
          if (json.status === 401) {
            this.sendRequest(url).then(json => {
              if (json.type === 'alert') this.alerts.push(json)
              else {
                this.user = json

                if (this.user.is_private) {
                  this.extraText = 'Приватный профиль. Информация скрыта.'
                  this.profileViewAccess = false
                } else this.profileViewAccess = true

                this.loading = false
              }
            })
          } else this.alerts.push(json)
        } else {
          let viewer = json

          this.sendRequest(url + '?username=' + json.username).then(json => {
            if (json.type === 'alert') this.alerts.push(json)
            else {
              this.user = json

              if (this.user.username === viewer.username) {
                if (this.user.is_private)
                  this.extraText = 'Ваш аккаунт приватный, другие пользователи (кроме друзей) не смогут увидеть информацию о Вас.'
                this.profileViewAccess = true
              } else if (this.user.is_friend) this.profileViewAccess = true
              else {
                this.extraText = 'Приватный аккаунт. Информация скрыта.'
                this.profileViewAccess = false
              }

              this.loading = false
            }
          })
        }
      })
    }
  },
  mounted() {
    this.setUserProfileInfo()
  }
}
</script>