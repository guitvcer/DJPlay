<template>
  <button
      type="submit"
      class="flex border hover:bg-gray-100 px-3 py-2 rounded mx-px sm:mx-1 dark:hover:bg-main dark:border-gray-600"
      v-if="type === 'submit'"
      @submit.prevent="$emit('submit')"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" v-if="buttonName === 'user_profile_edit_save'">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
    </svg>
  </button>
  <button
    type="button"
    :title="friendRequest === 'sent' ? 'Отменить запрос на дружбу' : (
        friendRequest === 'got' ? 'Принять запрос на дружбу' : (
            friendRequest === 'accepted' ? 'Удалить из друзей' : 'Добавить в друзья'
        )
    )"
    :class="[
        'flex border px-3 py-2 rounded mx-px sm:mx-1 hover:bg-gray-100 dark:hover:bg-main',
         friendRequest === 'accepted' || friendRequest === 'sent' ? ' border-friend-remove' : (
             friendRequest === 'got' ? ' border-friend-add': ' dark:border-gray-600'
         )
    ]"
    v-else-if="type === 'button'"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" v-if="buttonName === 'friend_request_button'">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
    <span class="block relative -top-0.5" v-if="buttonName === 'friend_request_button'">&nbsp; {{ friendsCount }}</span>
  </button>
  <router-link :to="url" class="flex border hover:bg-gray-100 px-3 py-2 rounded mx-px sm:mx-1 dark:hover:bg-main dark:border-gray-600" :title="title" v-else>
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

    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" v-if="buttonName === 'user_profile_edit_cancel'">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
    </svg>

    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" v-if="buttonName === 'user_profile_edit_change_password'">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>

    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" v-if="buttonName === 'user_profile_edit_delete'">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
    friendsCount: Number,
    url: Object,
    type: String,
    friendRequest: String
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