<template>
  <router-link
    v-if="interlocutor"
    :to="{ name: 'chat', params: { username: interlocutor.username } }"
    :class="[
      selected ? 'bg-main text-gray-200 dark:bg-main-dark2' :
      'bg-gray-100 hover:bg-white dark:bg-main-dark dark:hover:bg-main',
      ' flex px-4 py-2 my-0.5 rounded items-center'
    ]"
    @click="loadChat(interlocutor.username)"
  >
    <div
      :style="'background-image: url(' + interlocutor.avatar + '); background-size: 100% 100%'"
      class="mr-3 flex-shrink-0 w-12 h-12 rounded flex justify-end items-end"
    >
      <div v-if="interlocutor['isOnline']" class="w-4 h-4 rounded bg-green-500"></div>
    </div>
    <div class="truncate">
      <p class="font-semibold">{{ interlocutor.username }}</p>
      <p>{{ lastMessage }}</p>
    </div>
  </router-link>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { getInterlocutor } from "../../scripts/chat/index";

export default {
  props: {
    chat: {
      type: Object,
      required: true,
    },
  },
  methods: mapActions(["loadChat"]),
  computed: {
    ...mapGetters(["user"]),
    interlocutor() {
      return getInterlocutor(this.chat);
    },
    lastMessage() {
      if (this.chat['lastMessage']['sentFrom']['username'] === this.$route.params.username) {
        return this.chat["lastMessage"]["text"];
      } else {
        return `Вы: ${this.chat["lastMessage"]["text"]}`;
      }
    },
    selected() {
      return this.interlocutor.username === this.$route.params.username;
    },
  },
}
</script>