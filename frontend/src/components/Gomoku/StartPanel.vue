<template>
  <div class="bg-main dark:bg-main-dark text-gray-100 max-w-2xl w-full 2xl:w-auto rounded-md shadow-xl px-6 md:px-12 py-12 md:py-20 mb-10 flex flex-col justify-between mx-0 mx-auto 2xl:mx-4">
    <div><slot></slot></div>

    <div v-if="name === 'Gomoku'">
      <button
        class="px-6 py-4 w-full text-xl md:text-2xl font-semibold bg-gray-200 hover:bg-gray-300 text-black border rounded-md dark:border-main-dark2 dark:bg-main-dark2 dark:text-gray-200 dark:hover:bg-main"
        @click="$emit('find-opponent')"
        v-if="!$parent.gameStatus"
        tabindex="3"
      >Найти соперника</button>
      <button
        class="px-6 py-4 w-full text-xl md:text-2xl font-semibold bg-gray-200 hover:bg-gray-300 text-black border rounded-md dark:border-main-dark2 dark:bg-main-dark2 dark:text-gray-200 dark:hover:bg-main"
        @click="$emit('cancel-finding')"
        v-else-if="$parent.gameStatus === 'finding'"
        tabindex="3"
      >Отменить ожидание</button>
      <button
        class="px-6 py-4 w-full text-xl md:text-2xl font-semibold bg-gray-200 hover:bg-gray-300 text-black border rounded-md dark:border-main-dark2 dark:bg-main-dark2 dark:text-gray-200 dark:hover:bg-main"
        @click="$emit('give-up')"
        v-else-if="$parent.gameStatus === 'playing'"
        tabindex="3"
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
}
</script>