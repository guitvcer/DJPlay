<template>
  <div class="w-full">
    <div class="flex bg-main border-main-dark2 rounded-t px-8 py-2 text-gray-200 text-center">
      <div class="w-1/4">Игроки</div>
      <div class="w-1/4">Результат</div>
      <div class="w-1/4">Ходы</div>
      <div class="w-1/4">Дата</div>
    </div>
    <router-link
        to="/"
        v-for="(party, index) in partyList"
        :key="index"
        :class="[index === partyList.length - 1 ? 'rounded-b ' : '', 'flex px-8 py-2 text-center bg-white hover:bg-gray-100 dark:bg-main-dark2 dark:hover:bg-main']"
    >
      <div class="w-1/4">{{ party.player1 }}, {{ party.player2 }}</div>
      <div class="w-1/4">{{ getResult(party.winner) }}</div>
      <div class="w-1/4">{{ party.moves }}</div>
      <div class="w-1/4">{{ parseDate(party.date) }}</div>
    </router-link>
  </div>
</template>

<script>
import { DateTime } from 'luxon'

export default {
  props: {
    partyList: {
      type: Array,
      required: true
    },
    movesList: {
      type: Array,
      required: true
    },
    currentUsername: {
      type: String,
      required: true
    }
  },
  methods: {
    parseDate(date) {
      return DateTime.fromISO(date).setLocale('ru').toFormat('d MMMM y') + ' г.'
    },
    getResult(winner) {
      if (winner === null) return 'Н/Д'
      else if (winner === this.currentUsername) return 'Выигрыш'
      else return 'Проигрыш'
    }
  }
}
</script>