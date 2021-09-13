<template>
  <section
    :class="[!loading ? 'bg-gray-50 dark:bg-main-dark ' : 'flex justify-center ', 'mx-auto px-0 lg:px-12 py-16 mt-8']"
    style="max-width: 1400px"
  >
    <loading v-if="loading" class="m-auto" />
    <form v-if="!loading" :action="action" class="block lg:flex justify-around" @submit.prevent="submitForm">
      <edit-profile-avatar
        :user="user"
        @submit="submitForm"
        @create-alert="createAlert"
        @load-user="$emit('load-user')"
      />
      <edit-profile-table :user="user" />
    </form>
  </section>
</template>

<script>
import axios from 'axios'
import EditProfileAvatar from '@/components/EditProfile/EditProfileAvatar'
import EditProfileTable from '@/components/EditProfile/EditProfileTable'
import Loading from '@/components/Interface/Loading'

export default {
  data() {
    return {
      action: this.host + '/account/edit/',
      user: {},
      loading: true
    }
  },
  components: {
    EditProfileAvatar,
    EditProfileTable,
    Loading
  },
  methods: {
    createAlert(alert) {
      this.$emit('create-alert', alert)
    },
    async setUserProfileInfo() {
      await axios
        .get(this.host + '/account/')
        .then(response => {
          this.user = response.data
          this.loading = false
        })
        .catch(error => {
          if (error.response.status === 401 || error.response.status === 500)
            this.$emit('api-error', error)
        })
    },
    async submitForm(event) {
      const editProfileData = new FormData()

      if (event.target.avatar.files[0])
        editProfileData.append('avatar', event.target.avatar.files[0])
      else
        editProfileData.append('clearAvatar', event.target.avatar.dataset.clear)

      editProfileData.append('username', event.target.username.value)
      editProfileData.append('email', event.target.email.value)
      editProfileData.append('birthday', event.target['birthday'].value)
      editProfileData.append('firstName', event.target['firstName'].value)
      editProfileData.append('lastName', event.target['lastName'].value)
      editProfileData.append('gender', event.target['gender'].value)
      editProfileData.append('isPrivate', event.target['isPrivate'].value)

      await axios
        .patch(this.action, editProfileData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        .then(response => {
          this.$emit('create-alert', {
            title: 'Вы успешно обновили профиль.',
            level: 'success'
          })
          this.$emit('load-user')
          this.$router.push('/account/')
        })
        .catch(error => {
          if (error.response.status === 400) {
            for (const field in error.response.data) {
              this.$emit('create-alert', {
                title: this.parseErrors(error.response.data, field),
                level: 'danger'
              })
            }
          } else this.$emit('api-error', error)
        })
    }
  },
  mounted() {
    if (this.isAuthenticated()) {
      this.setUserProfileInfo()
      document.title = 'Изменить профиль'
    } else {
      this.$emit('create-alert', {
        level: 'danger',
        title: 'Вы не авторизованы.'
      })
      this.$router.push('/')
    }
  }
}
</script>