<template>
  <div class="px-4 py-2 border-b w-full flex items-center bg-white dark:bg-main-dark dark:border-main-dark2">
    <button
      @click="$emit('unselectChat')"
      class="rounded p-2 bg-gray-50 hover:bg-gray-100 border dark:border-main dark:bg-main-dark2 dark:hover:bg-main"
    >
      <arrow-left-icon class="h-5 w-5" />
    </button>
    <router-link
      :to="{ name: 'profile', params: { username: interlocutor.username } }"
      class="flex items-center hover:bg-gray-100 mx-2 p-2 dark:hover:bg-main rounded"
    >
      <img :src="this.host + this.interlocutor.avatar" :alt="'Аватар ' + interlocutor.username" class="w-12 h-12 rounded">
      <h2 class="text-xl font-semibold ml-2">{{ interlocutor.username }}</h2>
    </router-link>
  </div>
</template>

<script>
import { ArrowLeftIcon } from '@heroicons/vue/outline'

export default {
  props: {
    interlocutor: {
      type: Object,
      required: true
    }
  },
  components: {
    ArrowLeftIcon
  }
}
</script>