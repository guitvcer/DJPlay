<template>
  <div
    :class="['flex', message['sent_from']['username'] === currentUsername ? ' justify-end' : '']"
  >
    <div
      :class="[
        message['sent_from']['username'] === currentUsername ?
        'bg-white dark:bg-main dark:border-main-dark2' :
        'bg-main-light text-white dark:bg-main-dark2 dark:border-main',
        ' border px-2 py-1 rounded select-text'
      ]"
    >{{ message.text }}<small class="ml-1.5 select-none">{{ parseDate(message.date) }}</small>
    </div>
  </div>
</template>

<script>
import { DateTime } from 'luxon'

export default {
  props: {
    message: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      currentUsername: document.getElementById('username').innerHTML
    }
  },
  methods: {
    parseDate(date) {
      return DateTime.fromISO(date).setLocale('ru').toFormat('H:m')
    }
  }
}
</script>