<template>
  <chat-small-text v-if="otherDay(index, message.date)">{{ parseDate(message.date) }}</chat-small-text>
  <div
    :class="['flex', message['sentFrom']['username'] === currentUsername ? ' justify-end' : '']"
  >
    <div
      :class="[
        message['sentFrom']['username'] === currentUsername ?
        'bg-white dark:bg-main dark:border-main-dark2' :
        'bg-main-light text-white dark:bg-main-dark2 dark:border-main',
        ' border px-2 py-1 rounded select-text break-all'
      ]"
      style="max-width: 80%;"
    >
      {{ message.text }}
      <small class="ml-1.5 select-none">{{ parseTime(message.date) }}</small>
    </div>
  </div>
</template>

<script>
import { DateTime } from "luxon";
import ChatSmallText from "./ChatSmallText.vue";

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
  data() {
    return {
      currentUsername: document.getElementById("username").innerHTML,
    }
  },
  components: { ChatSmallText },
  methods: {
    parseTime(date) {
      return DateTime.fromISO(date).setLocale("ru").toFormat("H:m");
    },
    parseDate(date) {
      const messageDate = DateTime.fromISO(date);

      if (messageDate.year === DateTime.now().year) {
        return messageDate.setLocale("ru").toFormat("d MMMM");
      } else {
        return messageDate.setLocale("ru").toFormat("d MMMM y") + " г.";
      }
    },
    otherDay(index, date) {
      if (index === 0) {
        return true;
      }

      const messageDate = DateTime.fromISO(date);
      const nextMessageDate = DateTime.fromISO(this.$parent.messages[this.index - 1].date);

      return (messageDate.day !== nextMessageDate.day) ||
             (messageDate.month !== nextMessageDate.month) ||
             (messageDate.year !== nextMessageDate.year);
    }
  },
  mounted() {
    this.$parent.scrollToEnd();
  },
}
</script>