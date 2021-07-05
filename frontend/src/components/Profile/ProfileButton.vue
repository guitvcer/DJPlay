<template>
  <router-link :to="url" class="flex border hover:bg-gray-100 px-3 py-2 rounded mx-px sm:mx-1 dark:hover:bg-main dark:border-gray-600" :title="title">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" v-if="buttonName === 'friend_request_button'">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
    <span class="block relative -top-0.5" v-if="buttonName === 'friend_request_button'">&nbsp; {{ friendsCount }}</span>

    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" v-if="buttonName === 'user_chat_button'">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>

    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" v-if="buttonName === 'edit_profile_button'">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>

    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" v-if="buttonName === 'user_parties_button'">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  </router-link>
</template>

<script>
export default {
  props: {
    buttonName: {
      type: String,
      required: true
    },
    friendsCount: {
      type: Number
    },
    url: {
      type: Object,
      required: true
    }
  },
  computed: {
    title() {
      if (this.buttonName === 'friend_request')
        return 'Добавить в друзья'
      else if (this.buttonName === 'send_message')
        return 'Написать сообщение'
    }
  }
}
</script>