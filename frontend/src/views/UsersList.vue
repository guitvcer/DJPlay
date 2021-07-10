<template>
  <section class="bg-gray-50 dark:bg-main-dark mx-auto px-4 md:px-12 py-8 md:py-16" style="max-width: 1200px;">
    <div class="md:flex justify-between">
      <the-search />
      <h2 class="text-3xl font-semibold">Найдено: {{ usersList.length }}</h2>
    </div>
    <div class="md:flex flex-wrap mt-8">
      <user-item v-for="(user, index) in usersList" :key="index" :user="user" />
    </div>
  </section>
</template>

<script>
import TheSearch from '@/components/UsersList/TheSearch'
import UserItem from '@/components/UsersList/UserItem'

export default {
  components: {
    TheSearch, UserItem
  },
  data() {
    return {
      usersList: []
    }
  },
  mounted() {
    let access_token = this.getCookie('access'),
        init

    if (access_token) {
      init = {
        headers: {
          Authorization: 'Bearer ' + access_token
        }
      }
    }

    if (this.$route.name === 'usersFriends' || this.$route.name === 'usersViewers') {
      fetch(this.host + this.$route.path, init)
        .then(response => response.json())
        .then(json => {
          this.usersList = json
        })
    } else {
      fetch(this.host + '/account/users/', init)
        .then(response => response.json())
        .then(json => {
          this.usersList = json
        })
    }
  }
}
</script>