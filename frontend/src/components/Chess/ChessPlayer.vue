<template>
  <div class="flex justify-between my-2">
    <router-link to="/" class="flex rounded hover:bg-gray-200 dark:hover:bg-main p-2">
      <img
        :src="this.host + player.user.avatar"
        alt="Фото пользователя"
        class="w-12 h-12 rounded mx-2"
      >
      <div class="flex items-center mx-2">{{ player.user.username }}</div>
    </router-link>
    <div class="flex items-center">
      <div class="flex items-center bg-gray-200 dark:bg-main px-2 py-1 rounded">
        <clock-icon class="h-6 w-6 mr-2 relative top-0.5" />
        <span class="font-bold">{{ parseTime(player.secondsRemaining) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ClockIcon } from "@heroicons/vue/outline";
import { parseTime } from "../../scripts/chess/board";

export default {
  props: {
    player: {
      type: Object,
      required: true,
    },
  },
  components: { ClockIcon },
  methods: { parseTime },
}
</script>