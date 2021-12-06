<template>
  <div class="bg-main dark:bg-main-dark text-gray-100 max-w-2xl w-full 2xl:w-auto rounded-md shadow-xl px-6 md:px-12 py-12 md:py-20 mb-10 flex flex-col justify-between mx-0 mx-auto 2xl:mx-4">
    <div><slot></slot></div>

    <div v-if="name === 'Chess'">
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
      <button
        class="px-6 py-4 w-full text-xl md:text-2xl font-semibold bg-gray-200 hover:bg-gray-300 text-black border rounded-md dark:border-main-dark2 dark:bg-main-dark2 dark:text-gray-200 dark:hover:bg-main"
        @click="$emit('offer-draw')"
        v-else-if="$parent.gameStatus === 'playing'"
        tabindex="3"
      >Предложить ничью</button>
    </div>
    <div v-else-if="name === 'ChessParty'" class="hidden 2xl:flex px-8 justify-center mt-4">
      <button
        v-for="button in buttons"
        @click="button.onclick"
        class="
          px-6 py-4 mx-1 text-xl md:text-2xl font-semibold bg-gray-200 hover:bg-gray-300 text-black border rounded-md
          dark:border-main-dark2 dark:bg-main-dark2 dark:text-gray-200 dark:hover:bg-main
        "
      >
        <chevron-double-left-icon
          v-if="button.icon === 'chevron-double-left'"
          class="h-6 w-6"
        />
        <chevron-left-icon
          v-else-if="button.icon === 'chevron-left'"
          class="h-6 w-6"
        />
        <chevron-right-icon
          v-else-if="button.icon === 'chevron-right'"
          class="h-6 w-6"
        />
        <chevron-double-right-icon
          v-else-if="button.icon === 'chevron-double-right'"
          class="h-6 w-6"
        />
      </button>
    </div>
  </div>
</template>

<script>
import {
  ChevronDoubleLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleRightIcon
} from "@heroicons/vue/outline";

export default {
  props: {
    name: {
      type: String,
      required: true,
    },
  },
  components: {
    ChevronDoubleLeftIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronDoubleRightIcon,
  },
  data() {
    return {
      buttons: [
        {
          icon: "chevron-double-left",
          onclick: this.firstMove,
        },
        {
          icon: "chevron-left",
          onclick: this.prevMove,
        },
        {
          icon: "chevron-right",
          onclick: this.nextMove,
        },
        {
          icon: "chevron-double-right",
          onclick: this.lastMove,
        },
      ],
    }
  },
}
</script>