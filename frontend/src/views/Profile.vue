<template>
  <section class="bg-gray-50 dark:bg-main-dark block lg:flex justify-around mx-auto px-0 lg:px-12 py-16 mt-8" style="max-width: 1400px;">
    <profile-avatar :user="user" :profileViewAccess="profileViewAccess" v-if="!loading" />
    <profile-table v-if="profileViewAccess" :user="user" :extraText="extraText" />
    <profile-table v-else :extraText="extraText" />
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
      loading: true,
      profileViewAccess: false,
      extraText: ''
    }
  },
  methods: {
    setUserProfileInfo() {
      let url = this.host + '/account/' + this.$route.params.username,
          access_token = this.getCookie('access'),
          viewer, init, is_authorized

      if (access_token) {
        fetch(this.host + '/account', {
          headers: {
            Authorization: 'Bearer ' + access_token
          }
        }).then(response => response.json())
          .then(json => {
            viewer = json
            is_authorized = true
            url += '?username=' + viewer.username
            init = {
              headers: {
                Authorization: 'Bearer ' + access_token
              }
            }

            fetch(url, init)
              .then(response => response.json())
              .then(json => {
                this.user = json

                console.log(this.user)

                if (is_authorized) {
                  if (this.user.username === viewer.username) {
                    this.extraText = 'Ваш аккаунт приватный, другие пользователи (кроме друзей) не смогут увидеть информацию о Вас.'
                    this.profileViewAccess = true
                  } else if (this.user.is_friend) this.profileViewAccess = true
                } else if (this.user.is_private) {
                  this.extraText = 'Приватный профиль. Информация скрыта.'
                }

                this.loading = false
              })
          })
      } else {
        fetch(url)
          .then(response => response.json())
          .then(json => {
            this.user = json
            
            if (this.user.is_private) {
              this.extraText = 'Приватный профиль. Информация скрыта.'
            }

            this.loading = false
          })
      }
    }
  },
  mounted() {
    this.setUserProfileInfo()
  }
}
</script>