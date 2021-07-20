<template>
  <section
      class="bg-gray-50 dark:bg-main-dark mx-auto px-0 lg:px-12 py-16 mt-8"
      style="max-width: 1400px;"
      v-if="!loading"
  >
    <form :action="action" class="block lg:flex justify-around" @submit.prevent="submitForm">
      <edit-profile-avatar :user="user" @submit="submitForm" />
      <edit-profile-table :user="user" />
    </form>
  </section>
</template>

<script>
import EditProfileAvatar from '@/components/EditProfile/EditProfileAvatar'
import EditProfileTable from '@/components/EditProfile/EditProfileTable'

export default {
  data() {
    return {
      alerts: [],
      action: this.host + '/account/edit/',
      user: {},
      loading: true
    }
  },
  components: {
    EditProfileAvatar,
    EditProfileTable
  },
  methods: {
    setUserProfileInfo() {
      this.sendRequest(this.host + '/account/').then(json => {
        if (json.type === 'alert') this.$emit('create-alert', json)
        else {
          this.user = json
          this.loading = false
        }
      })
    },
    submitForm(event) {
      // let body = {
      //   avatar: event.target.avatar.files[0],
      //   username: event.target.username.value,
      //   email: event.target.email.value,
      //   birthday: (event.target.birthday.value !== "") ? event.target.birthday.value : null,
      //   first_name: event.target.first_name.value,
      //   last_name: event.target.last_name.value,
      //   gender: event.target.gender.value,
      //   is_private: event.target.is_private.value
      // }
      //
      // console.log(body)
      const editProfileData = new FormData()

      if (event.target.avatar.files[0])
        editProfileData.append('avatar', event.target.avatar.files[0])
      else
        editProfileData.append('clear_avatar', event.target.avatar.dataset.clear)

      editProfileData.append('username', event.target.username.value)
      editProfileData.append('email', event.target.email.value)
      editProfileData.append('birthday', event.target.birthday.value)
      editProfileData.append('first_name', event.target.first_name.value)
      editProfileData.append('last_name', event.target.last_name.value)
      editProfileData.append('gender', event.target.gender.value)
      editProfileData.append('is_private', event.target.is_private.value)

      this.sendRequest(
          this.action, 'PATCH', editProfileData,
          'multipart/form-data; boundary=----WebKitFormBoundaryf5ZTx2ZOKUxVlo1D'
      ).then(json => {
        if (json.type === 'alert') {
          for (let alert of json.alerts)
            this.$emit('create-alert', alert)
        } else {
          this.$emit('create-alert', {
            title: json.title,
            level: 'success'
          })
          this.$emit('load-user')
          this.$router.push('/account/')
        }
      })
    }
  },
  mounted() {
    if (this.isAuthenticated()) this.setUserProfileInfo()
    else {
      this.$emit('create-alert', {
        level: 'danger',
        title: 'Вы не авторизованы.'
      })
      this.$router.push('/')
    }
  }
}
</script>