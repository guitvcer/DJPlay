<template>
  <div class="bg-main dark:bg-main-dark text-gray-100 max-w-2xl w-full 2xl:w-auto rounded-md shadow-xl px-6 md:px-12 py-12 md:py-20 mb-10 flex flex-col justify-between mx-0 mx-auto 2xl:mx-4">
    <div v-if="name === 'Gomoku'">
      <h2 class="text-2xl md:text-4xl mb-4">{{ game.name }}</h2>
      <p class="mb-12 md:mb-20">{{ game.rules }}</p>
    </div>
    <div v-else-if="name === 'GomokuParty'">
      <p class="mb-4 flex justify-between">
        <router-link
          :to="{ name: 'profile', params: { username: party.player1 } }"
          :class="[
            party.player1 === party['winner'] ? 'border-green-600' : 'border-red-700',
            ' w-1/3 pt-2 rounded border hover:bg-main-dark dark:hover:bg-main-dark2'
          ]"
        >
          <img :src="this.host + this.player1.avatar" :alt="party.player1" class="w-8 m-auto">
          <strong class="block text-center">{{ this.party.player1 }}</strong>
        </router-link>
        <strong class="text-2xl md:text-4xl w-1/3 text-center pt-4">VS.</strong>
        <router-link
          :to="{ name: 'profile', params: { username: party.player2 } }"
          :class="[
            party.player2 === party['winner'] ? 'border-green-600' : 'border-red-700',
            ' w-1/3 pt-2 rounded border hover:bg-main-dark dark:hover:bg-main-dark2'
          ]"
        >
          <img :src="this.host + this.player2.avatar" :alt="party.player2" class="w-8 m-auto">
          <strong class="block text-center">{{ this.party.player2 }}</strong>
        </router-link>
      </p>
      <p>
        <span class="mr-2">Количество ходов : </span>
        <span class="font-semibold">{{ party.moves.length }}</span>
      </p>
      <p>
        <span class="mr-2">Дата : </span>
        <span class="font-semibold">{{ parseDate(party.date) }}</span>
      </p>
    </div>

    <div v-if="name === 'Gomoku'">
      <button
          class="px-6 py-4 w-full text-xl md:text-2xl font-semibold bg-gray-200 hover:bg-gray-300 text-black border rounded-md dark:border-main-dark2 dark:bg-main-dark2 dark:text-gray-200 dark:hover:bg-main"
          @click="$emit('find-opponent')"
          v-if="!$parent.gameStatus"
      >Найти соперника</button>
      <button
          class="px-6 py-4 w-full text-xl md:text-2xl font-semibold bg-gray-200 hover:bg-gray-300 text-black border rounded-md dark:border-main-dark2 dark:bg-main-dark2 dark:text-gray-200 dark:hover:bg-main"
          @click="$emit('cancel-finding')"
          v-else-if="$parent.gameStatus === 'finding'"
      >Отменить ожидание</button>
      <button
          class="px-6 py-4 w-full text-xl md:text-2xl font-semibold bg-gray-200 hover:bg-gray-300 text-black border rounded-md dark:border-main-dark2 dark:bg-main-dark2 dark:text-gray-200 dark:hover:bg-main"
          @click="$emit('give-up')"
          v-else-if="$parent.gameStatus === 'playing'"
      >Сдаться</button>
    </div>
    <div v-else-if="name === 'GomokuParty'" class="hidden 2xl:flex px-8 justify-center mt-4">
      <button
        class="px-6 py-4 mx-1 text-xl md:text-2xl font-semibold bg-gray-200 hover:bg-gray-300 text-black border rounded-md dark:border-main-dark2 dark:bg-main-dark2 dark:text-gray-200 dark:hover:bg-main"
        @click="$emit('firstMove')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>
      <button
        class="px-6 py-4 mx-1 text-xl md:text-2xl font-semibold bg-gray-200 hover:bg-gray-300 text-black border rounded-md dark:border-main-dark2 dark:bg-main-dark2 dark:text-gray-200 dark:hover:bg-main"
        @click="$emit('prevMove')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        class="px-6 py-4 mx-1 text-xl md:text-2xl font-semibold bg-gray-200 hover:bg-gray-300 text-black border rounded-md dark:border-main-dark2 dark:bg-main-dark2 dark:text-gray-200 dark:hover:bg-main"
        @click="$emit('nextMove')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <button
        class="px-6 py-4 mx-1 text-xl md:text-2xl font-semibold bg-gray-200 hover:bg-gray-300 text-black border rounded-md dark:border-main-dark2 dark:bg-main-dark2 dark:text-gray-200 dark:hover:bg-main"
        @click="$emit('lastMove')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
import { DateTime } from 'luxon'

export default {
  props: {
    name: {
      type: String,
      required: true
    },
    game: Object,
    party: Object,
    player1: Object,
    player2: Object
  },
  methods: {
    parseDate(date) {
      return DateTime.fromISO(date).setLocale('ru').toFormat('d MMMM y') + ' г.'
    }
  },
}
</script>