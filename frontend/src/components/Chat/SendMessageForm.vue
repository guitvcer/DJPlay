<template>
  <form
    class="w-full flex items-center border-t p-2 dark:border-main-dark2"
    method="post"
    @submit.prevent="$emit('submit-message', messageText); messageText = ''"
  >
    <input
      type="text"
      placeholder="Введите сообщение"
      maxlength="256"
      required
      class="mr-1 rounded border px-4 py-1 w-full dark:bg-main-dark2 dark:border-main"
      v-model="messageText"
    >
    <button
      type="submit"
      class="border p-1 hover:bg-main rounded bg-main-light dark:bg-main-dark2 text-white dark:border-main"
    >
      <chevron-right-icon class="h-7 w-7" />
    </button>
  </form>
</template>

<script>
import { ChevronRightIcon } from '@heroicons/vue/outline'

export default {
  components: {
    ChevronRightIcon
  },
  data() {
    return {
      messageText: ''
    }
  }
}
</script>