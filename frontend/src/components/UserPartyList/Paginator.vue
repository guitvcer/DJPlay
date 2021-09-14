<template>
  <div class="flex items-center justify-center">
    <button
      v-if="previousPage"
      @click="$emit('first')"
      class="rounded dark:bg-main-dark2 dark:hover:bg-main py-1 px-2 mr-1"
    >Первая</button>
    <button
      v-if="previousPage"
      @click="$emit('prev')"
      class="rounded dark:bg-main-dark2 dark:hover:bg-main p-2 mx-0.5"
    >
      <chevron-left-icon class="h-5 w-5" />
    </button>
    <button class="rounded dark:bg-main-dark2 dark:hover:bg-main py-1 px-3 mx-0.5">
      {{ page }}
    </button>
    <button
      v-if="nextPage"
      @click="$emit('next')"
      class="rounded dark:bg-main-dark2 dark:hover:bg-main p-2 mx-0.5"
    >
      <chevron-right-icon class="h-5 w-5" />
    </button>
    <button
      v-if="nextPage"
      @click="$emit('last')"
      class="rounded dark:bg-main-dark2 dark:hover:bg-main py-1 px-2 ml-1"
    >Последняя</button>
  </div>
</template>

<script>
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/outline'

export default {
  props: {
    page: {
      type: Number,
      required: true
    },
    nextPage: String,
    previousPage: String
  },
  components: {
    ChevronLeftIcon, ChevronRightIcon
  }
}
</script>