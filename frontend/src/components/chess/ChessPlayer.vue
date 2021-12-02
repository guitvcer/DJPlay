<template>
  <div>
    <div class="flex justify-between my-1">
      <div class="flex">
        <router-link
          :to="{ name: 'profile', params: { username: players[index].user.username } }"
          class="flex rounded hover:bg-gray-200 dark:hover:bg-main p-1"
        >
          <img
            :src="this.baseURL + players[index].user.avatar"
            alt="Фото пользователя"
            class="w-10 h-10 rounded mx-2"
          >
          <div class="flex items-center mx-2">{{ players[index].user.username }}</div>
        </router-link>
        <div class="hidden md:flex items-center">
          <div v-for="piece in pieces">
            <div
              v-if="players[index].eatenPieces[piece.name] > 0"
              class="flex mx-1"
            >
              {{ players[index].eatenPieces[piece.name] }}x
              <img
                class="w-6 h-6"
                :src="url + '/' + piece.name + '.svg'"
                :alt="piece.title"
              >
            </div>
          </div>
        </div>
      </div>
      <div class="flex items-center">
        <div class="flex items-center bg-gray-200 dark:bg-main px-2 py-1 rounded">
          <clock-icon class="h-6 w-6 mr-2 relative top-0.5" />
          <span class="font-bold">{{ parseTime(players[index].secondsRemaining) }}</span>
        </div>
      </div>
    </div>
    <div class="flex md:hidden mt-1 mb-2 mx-2">
      <div v-for="piece in pieces">
        <div
          v-if="players[index].eatenPieces[piece.name] > 0"
          class="flex mx-1"
        >
          {{ players[index].eatenPieces[piece.name] }}x
          <img
            class="w-6 h-6"
            :src="url + '/' + piece.name + '.svg'"
            :alt="piece.title"
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { ClockIcon } from "@heroicons/vue/outline";
import { parseTime } from "../../scripts/chess/board";
import { WHITE, BLACK } from "../../scripts/chess/constants";

export default {
  props: {
    index: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      WHITE, BLACK,
      pieces: [
        { name: "queen", title: "Ферзь" },
        { name: "knight", title: "Конь" },
        { name: "rook", title: "Ладья" },
        { name: "bishop", title: "Слон" },
        { name: "pawn", title: "Пешка" },
      ]
    }
  },
  components: { ClockIcon },
  methods: { parseTime },
  computed: {
    ...mapGetters("chess", ["players"]),
    url() {
      return this.baseURL + '/media/chess/pieces/' + (this.players[this.index].color === WHITE ? BLACK : WHITE);
    }
  }
}
</script>