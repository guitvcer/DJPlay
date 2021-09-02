<template>
  <button
    type="submit"
    class="flex border hover:bg-gray-100 px-3 py-2 rounded mx-px sm:mx-1 dark:hover:bg-main dark:border-gray-600"
    v-if="type === 'submit'"
    @submit.prevent="$emit('submit')"
  >
    <check-icon class="h-6 w-6" v-if="buttonName === 'userProfileEditSave'" />
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
      v-if="buttonName === 'friendRequestButton' && (friendRequest === 'accepted' || friendRequest === 'sent')"
    />
    <user-add-icon class="h-6 w-6" v-else-if="buttonName === 'friendRequestButton'" />
    <span class="block relative -top-0.5" v-else-if="buttonName === 'friendRequestButton'">&nbsp; {{ friendsCount }}</span>
    <cog-icon class="h-6 w-6" v-else-if="buttonName === 'userProfileEditChangePassword'" />
    <trash-icon v-else-if="buttonName === 'userProfileEditDelete'" class="h-6 w-6" />
  </button>
  <router-link
    :to="url"
    class="flex border hover:bg-gray-100 px-3 py-2 rounded mx-px sm:mx-1 dark:hover:bg-main dark:border-gray-600"
    :title="title"
    v-else
  >
    <user-group-icon
      class="h-6 w-6"
      v-if="buttonName === 'friendsButton'"
    />
    <user-remove-icon
      class="h-6 w-6"
      v-else-if="buttonName === 'friendRequestButton' && (friendRequest === 'accepted' || friendRequest === 'sent')"
    />

    <user-add-icon class="h-6 w-6" v-if="buttonName === 'friendRequestButton'" />
    <span class="block relative -top-0.5" v-else-if="buttonName === 'friendRequestButton'">&nbsp; {{ friendsCount }}</span>

    <chat-icon v-if="buttonName === 'userChatButton'" class="h-6 w-6" />
    <pencil-icon class="h-6 w-6" v-else-if="buttonName === 'editProfileButton'" />
    <lightning-bolt-icon class="h-6 w-6" v-else-if="buttonName === 'userPartyListButton'" />
    <arrow-sm-left-icon class="h-6 w-6" v-else-if="buttonName === 'userProfileEditCancel'" />
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
  UserGroupIcon,
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
    UserGroupIcon,
    UserAddIcon,
    UserRemoveIcon
  },
  computed: {
    title() {
      if (this.buttonName === 'friendRequest') return 'Добавить в друзья'
      else if (this.buttonName === 'sendMessage') return 'Написать сообщение'
    }
  }
}
</script>