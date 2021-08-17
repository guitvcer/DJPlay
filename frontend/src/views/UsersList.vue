<template>
  <section :class="[!loading ? 'bg-gray-50 dark:bg-main-dark ' : 'flex justify-center ', 'mx-auto px-4 md:px-12 py-8 md:py-16']" style="max-width: 1200px;">
    <alert v-if="alerts.length" :alerts="alerts" />
    <loading v-if="loading" />
    <div class="md:flex justify-between" v-if="!loading">
      <the-search @sent="loadList" />
      <h2 class="text-3xl font-semibold">Найдено: {{ usersList.length }}</h2>
    </div>
    <div class="md:flex flex-wrap mt-8" v-if="usersList.length && !loading">
      <user-item v-for="(user, index) in usersList" :key="index" :user="user" />
    </div>
  </section>
</template>

<script>
import axios from 'axios'
import Alert from '@/components/Alert'
import TheSearch from '@/components/UsersList/TheSearch'
import UserItem from '@/components/UsersList/UserItem'
import Loading from '@/components/Loading'

export default {
  components: {
    Alert, TheSearch, UserItem, Loading
  },
  data() {
    return {
      usersList: [],
      alerts: [],
      loading: true
    }
  },
  methods: {
    loadList(usersList) {
      this.usersList = usersList
    }
  },
  async mounted() {
    let url = this.host

    if (
        this.$route.name === 'usersFriends' ||
        this.$route.name === 'usersViewers' ||
        this.$route.name === 'friends' ||
        this.$route.name === 'viewers'
    ) {
      url += this.$route.path
    } else {
      url += '/account/users'
    }

    await axios
      .get(url)
      .then(response => {
        this.usersList = response.data
        this.loading = false
      })
      .catch(error => this.$emit('api-error', error))
  }
}
</script>