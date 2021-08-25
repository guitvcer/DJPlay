<template>
  <router-link
    :to="{ name: 'chat', params: { username: interlocutor.username } }"
    :class="[
      selected ? 'bg-main text-gray-200 dark:bg-main-dark2' :
      'bg-gray-100 hover:bg-white dark:bg-main-dark dark:hover:bg-main',
      ' flex px-4 py-2 my-0.5 rounded items-center'
    ]"
    @click="$emit('load-chat')"
  >
    <div class="mr-3 flex-shrink-0">
      <img :src="interlocutor.avatar" :alt="'Аватар ' + interlocutor.username" class="w-12 h-12 rounded">
    </div>
    <div class="truncate">
      <p class="font-semibold">{{ interlocutor.username }}</p>
      <p>{{ lastMessage }}</p>
    </div>
  </router-link>
</template>

<script>
export default {
  props: {
    chat: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      interlocutor: {},
      currentUsername: document.getElementById('username').innerHTML
    }
  },
  mounted() {
    this.setInterlocutor()
  },
  methods: {
    setInterlocutor() {
      if (this.chat['user1']['username'] === this.currentUsername) this.interlocutor = this.chat['user2']
      else this.interlocutor = this.chat['user1']
    }
  },
  computed: {
    lastMessage() {
      if (this.chat['last_message']['sent_from']['username'] === this.currentUsername)
        return `Вы: ${this.chat['last_message']['text']}`
      else return this.chat['last_message']['text']
    },
    selected() {
      return this.interlocutor.username === this.$route.params.username
    }
  }
}
</script>