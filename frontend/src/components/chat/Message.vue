<template>
  <chat-small-text v-if="otherDay(index, message.date)">{{ parseMessageDate(message.date) }}</chat-small-text>
  <div
    :class="['flex', message['sentFrom']['username'] === user.username ? ' justify-end' : '']"
  >
    <div
      :class="[
        message['sentFrom']['username'] === user.username ?
        'bg-white dark:bg-main dark:border-main-dark2' :
        'bg-main-light text-white dark:bg-main-dark2 dark:border-main',
        ' border px-2 py-1 rounded select-text break-all'
      ]"
      style="max-width: 80%;"
    >
      {{ message.text }}
      <small class="ml-1.5 select-none">{{ parseMessageTime(message.date) }}</small>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import ChatSmallText from "./ChatSmallText.vue";
import { parseMessageDate, parseMessageTime, otherDay } from "../../scripts/chat/index";

export default {
  props: {
    message: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
  },
  components: { ChatSmallText },
  computed: mapGetters(["user", "chat"]),
  methods: { parseMessageDate, parseMessageTime, otherDay },
}
</script>