<template>
  <section class="bg-gray-50 dark:bg-main-dark mx-auto px-4 md:px-12 py-8 md:py-16" style="max-width: 1200px;">
    <div class="md:flex justify-between">
      <the-search />
      <h2 class="text-3xl font-semibold">Найдено: {{ users.length }}</h2>
    </div>
    <div class="md:flex flex-wrap mt-8">
      <user-item v-for="(user, index) in users" :key="index" :user="user" />
    </div>
  </section>
</template>

<script>
import TheSearch from '@/components/UsersList/TheSearch'
import UserItem from '@/components/UsersList/UserItem'

export default {
  data() {
    return {
      users: [
        {
          username: 'admin',
          avatar: 'user.png'
        }
      ]
    }
  },
  components: {
    TheSearch, UserItem
  }
}
</script>