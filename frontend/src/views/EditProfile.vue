<template>
  <section
      class="bg-gray-50 dark:bg-main-dark mx-auto px-0 lg:px-12 py-16 mt-8"
      style="max-width: 1400px;"
      v-if="!loading"
  >
    <alert v-if="alerts.length" :alerts="alerts" />
    <form :action="action" class="block lg:flex justify-around" @submit.prevent="submitForm">
      <edit-profile-avatar :user="user" @submit="submitForm" />
      <edit-profile-table :user="user" />
    </form>
  </section>
</template>

<script>
import Alert from '@/components/Alert'
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
    Alert,
    EditProfileAvatar,
    EditProfileTable
  },
  methods: {
    setUserProfileInfo() {
      this.sendRequest(this.host + '/account/').then(json => {
        if (json.type === 'alert') this.alerts.push(json)
        else {
          this.user = json
          this.loading = false
        }
      })
    },
    submitForm(event) {
      let body = {
        username: event.target.username.value,
        email: event.target.email.value,
        birthday: (event.target.birthday.value !== "") ? event.target.birthday.value : null,
        first_name: event.target.first_name.value,
        last_name: event.target.last_name.value,
        gender: event.target.gender.value,
        is_private: event.target.is_private.value
      }

      this.sendRequest(this.action, 'PATCH', body).then(json => {
        if (json.type === 'alert') this.alerts.push(json)
        else this.alerts.push({
          title: json.title,
          level: 'success'
        })
      })
    }
  },
  mounted() {
    this.setUserProfileInfo()
  }
}
</script>