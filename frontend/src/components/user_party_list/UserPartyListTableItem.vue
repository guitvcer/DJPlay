<template>
  <router-link
    :to="{ name: 'gomokuParty', params: { id: party.id } }"
    class="flex p-2 text-center bg-white hover:bg-gray-100 dark:bg-main-dark2 dark:hover:bg-main"
  >
    <div class="w-1/4">{{ party.player1 }}, {{ party.player2 }}</div>
    <div class="w-1/4">{{ getResult(party['winner']) }}</div>
    <div class="w-1/4">{{ party['movesCount'] }}</div>
    <div class="w-1/4">{{ parseDate(party.date) }}</div>
  </router-link>
</template>

<script>
import { DateTime } from "luxon";

export default {
  props: {
    party: {
      type: Object,
      required: true,
    },
    currentUsername: {
      type: String,
      required: true,
    },
  },
  methods: {
    parseDate(date) {
      return DateTime.fromISO(date).setLocale("ru").toFormat("d MMMM y H:m");
    },
    getResult(winner) {
      if (winner === null) {
        return "Н/Д";
      } else if (winner === this.currentUsername) {
        return "Выигрыш";
      } else {
        return "Проигрыш";
      }
    },
  },
}
</script>