<template>
  <button
      type="submit"
      class="flex border hover:bg-gray-100 px-3 py-2 rounded mx-px sm:mx-1 dark:hover:bg-main dark:border-gray-600"
      v-if="type === 'submit'"
      @submit.prevent="$emit('submit')"
  >
    <check-icon class="h-6 w-6" v-if="buttonName === 'user_profile_edit_save'" />
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
             friendRequest === 'got' ? ' border-friend-add' : ' dark:border-gray-600'
         )
    ]"
    v-else-if="type === 'button'"
  >
    <user-remove-icon
        class="h-6 w-6"
        v-if="buttonName === 'friend_request_button' && (friendRequest === 'accepted' || friendRequest === 'sent')"
    />
    <user-add-icon class="h-6 w-6" v-else-if="buttonName === 'friend_request_button'" />
    <span class="block relative -top-0.5" v-else-if="buttonName === 'friend_request_button'">&nbsp; {{ friendsCount }}</span>
    <cog-icon class="h-6 w-6" v-else-if="buttonName === 'user_profile_edit_change_password'" />
    <trash-icon v-else-if="buttonName === 'user_profile_edit_delete'" class="h-6 w-6" />
  </button>
  <router-link
      :to="url"
      class="flex border hover:bg-gray-100 px-3 py-2 rounded mx-px sm:mx-1 dark:hover:bg-main dark:border-gray-600"
      :title="title"
      v-else
  >
    <user-remove-icon
        class="h-6 w-6"
        v-if="buttonName === 'friend_request_button' && (friendRequest === 'accepted' || friendRequest === 'sent')"
    />
    <user-add-icon class="h-6 w-6" v-else-if="buttonName === 'friend_request_button'" />
    <span class="block relative -top-0.5" v-else-if="buttonName === 'friend_request_button'">&nbsp; {{ friendsCount }}</span>
    <chat-icon v-else-if="buttonName === 'user_chat_button'" class="h-6 w-6" />
    <pencil-icon class="h-6 w-6" v-else-if="buttonName === 'edit_profile_button'" />
    <lightning-bolt-icon class="h-6 w-6" v-else-if="buttonName === 'user_party_list_button'" />
    <arrow-sm-left-icon class="h-6 w-6" v-else-if="buttonName === 'user_profile_edit_cancel'" />
  </router-link>
</template>

<script>
import {
  ArrowSmLeftIcon,
  ChatIcon,
  CheckIcon,
  CogIcon,
  LightningBoltIcon,
  PencilIcon,
  TrashIcon,
  UserAddIcon,
  UserRemoveIcon
} from '@heroicons/vue/outline'

export default {
  props: {
    buttonName: {
      type: String,
      required: true
    },
    friendsCount: Number,
    url: Object,
    type: String,
    friendRequest: [String, Boolean]
  },
  components: {
    ArrowSmLeftIcon,
    ChatIcon,
    CheckIcon,
    CogIcon,
    LightningBoltIcon,
    PencilIcon,
    TrashIcon,
    UserAddIcon,
    UserRemoveIcon
  },
  computed: {
    title() {
      if (this.buttonName === 'friend_request') return 'Добавить в друзья'
      else if (this.buttonName === 'send_message') return 'Написать сообщение'
    }
  }
}
</script>