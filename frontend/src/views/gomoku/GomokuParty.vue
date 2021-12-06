<template>
  <section
    class="flex flex-col-reverse 2xl:flex-row mx-auto justify-center 2xl:justify-between px-0 md:px-16"
    @keydown.ctrl.left="firstMove"
    @keydown.left="prevMove"
    @keydown.right="nextMove"
    @keydown.ctrl.right="lastMove"
  >
    <loading v-if="loading" class="m-auto" />
    <gomoku-board v-if="!loading" action="GomokuParty" />

    <start-panel
      v-if="!loading"
      action="GomokuParty"
    >
      <p class="mb-4 flex justify-between">
        <router-link
          :to="{ name: 'profile', params: { username: party['player1'].username } }"
          :class="[
            party['player1'].id === party['winner'].id ? 'border-green-600' : 'border-red-700',
            ' w-1/3 pt-2 rounded border hover:bg-main-dark dark:hover:bg-main-dark2'
          ]"
        >
          <img :src="this.baseURL + party['player1'].avatar" :alt="party['player1'].username" class="w-8 m-auto">
          <strong class="block text-center">{{ party["player1"].username }}</strong>
        </router-link>

        <strong class="text-2xl md:text-4xl w-1/3 text-center pt-4">VS.</strong>

        <router-link
          :to="{ name: 'profile', params: { username: party['player2'].username } }"
          :class="[
            party['player2'].id === party['winner'].id ? 'border-green-600' : 'border-red-700',
            ' w-1/3 pt-2 rounded border hover:bg-main-dark dark:hover:bg-main-dark2'
          ]"
        >
          <img :src="this.baseURL + party['player2'].avatar" :alt="party['player2'].username" class="w-8 m-auto">
          <strong class="block text-center">{{ party["player2"].username }}</strong>
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
    </start-panel>

    <control-panel v-if="!loading" action="GomokuParty" />
  </section>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import ControlPanel from "../../components/gomoku/ControlPanel.vue";
import GomokuBoard from "../../components/gomoku/GomokuBoard.vue";
import StartPanel from "../../components/gomoku/StartPanel.vue";
import Loading from "../../components/interface/Loading.vue";
import { parseDate } from "../../scripts/account/profile.js";
import { GAME_STASUSES } from "../../scripts/gomoku/constants";

export default {
  components: { ControlPanel, GomokuBoard, StartPanel, Loading },
  data() {
    return {
      loading: true,
    }
  },
  methods: {
    ...mapActions("gomoku", [
      "resetBoard",
      "lastMove",
      "loadParty",
      "firstMove",
      "prevMove",
      "nextMove",
      "lastMove",
    ]),
    ...mapMutations("gomoku", ["updateGameStatus"]),
    parseDate,
  },
  async mounted() {
    this.resetBoard();
    this.updateGameStatus(GAME_STASUSES.WATCH);
    await this.loadParty();
    this.lastMove();
    this.loading = false;

    document.title = `${this.party["player1"].username} VS. ${this.party["player2"].username}`;
  },
  computed: mapGetters("gomoku", ["party"]),
}
</script>