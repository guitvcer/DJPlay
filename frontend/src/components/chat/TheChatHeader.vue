<template>
  <div class="px-4 py-2 border-b w-full flex items-center bg-white dark:bg-main-dark dark:border-main-dark2">
    <button
      @click="unselectChat"
      class="rounded p-2 bg-gray-50 hover:bg-gray-100 border dark:border-main dark:bg-main-dark2 dark:hover:bg-main"
    >
      <arrow-left-icon class="h-5 w-5" />
    </button>

    <router-link
      :to="{ name: 'profile', params: { username: interlocutor.username } }"
      class="flex items-center hover:bg-gray-100 mx-2 p-2 dark:hover:bg-main rounded w-full"
    >
      <div
        :style="'background-image: url(' + interlocutor.avatar + '); background-size: 100% 100%;'"
        class="w-12 h-12 rounded flex justify-end items-end"
      >
        <div v-if="interlocutor['isOnline']" class="rounded w-4 h-4 bg-green-500"></div>
      </div>
      <div class="ml-3">
        <h2 class="text-xl font-semibold">{{ interlocutor.username }}</h2>
        <p class="text-gray-500" v-if="interlocutor['isOnline']">В сети</p>
        <p class="text-gray-500" v-else>{{ lastOnline() }}{{ parseDate(interlocutor['lastOnline']) }}</p>
      </div>
    </router-link>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { ArrowLeftIcon } from "@heroicons/vue/outline";
import { lastOnline, parseDate } from "../../scripts/chat/index";

export default {
  components: { ArrowLeftIcon },
  computed: mapGetters(["interlocutor"]),
  methods: {
    ...mapActions(["unselectChat"]),
    lastOnline, parseDate,
  },
}
</script>