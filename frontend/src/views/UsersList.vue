<template>
  <section class="bg-gray-50 dark:bg-main-dark mx-auto px-4 md:px-12 py-8 md:py-16" style="max-width: 1200px;">
    <alert v-if="alerts.length" :alerts="alerts" />
    <div class="md:flex justify-between">
      <the-search />
      <h2 class="text-3xl font-semibold">Найдено: {{ usersList.length }}</h2>
    </div>
    <div class="md:flex flex-wrap mt-8" v-if="usersList.length">
      <user-item v-for="(user, index) in usersList" :key="index" :user="user" />
    </div>
  </section>
</template>

<script>
import Alert from '@/components/Alert'
import TheSearch from '@/components/UsersList/TheSearch'
import UserItem from '@/components/UsersList/UserItem'

export default {
  components: {
    Alert, TheSearch, UserItem
  },
  data() {
    return {
      usersList: [],
      alerts: []
    }
  },
  mounted() {
    let url = this.host

    if (this.$route.name === 'usersFriends' || this.$route.name === 'usersViewers') {
      url += this.$route.path
    } else {
      url += '/account/users'
    }

    this.sendRequest(url).then(json => {
      if (json.type === 'alert') this.alerts.push(json)
      else {
        this.usersList = json
      }
    })
  }
}
</script>