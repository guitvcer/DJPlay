<template>
  <section
    class="flex flex-col-reverse 2xl:flex-row mx-auto justify-center 2xl:justify-between px-0 md:px-16"
    @keydown.left="prevMove"
    @keydown.right="nextMove"
  >
    <loading v-if="loading" class="m-auto" />
    <gomoku-board v-if="!loading" name="GomokuParty" ref="gomokuBoard" />

    <start-panel
      v-if="!loading"
      name="GomokuParty"
      :party="party"
      :player1="player1"
      :player2="player2"
      @firstMove="firstMove"
      @prevMove="prevMove"
      @nextMove="nextMove"
      @lastMove="lastMove"
    >
      <p class="mb-4 flex justify-between">
        <router-link
          :to="{ name: 'profile', params: { username: party.player1 } }"
          :class="[
            party.player1 === party['winner'] ? 'border-green-600' : 'border-red-700',
            ' w-1/3 pt-2 rounded border hover:bg-main-dark dark:hover:bg-main-dark2'
          ]"
        >
          <img :src="this.baseURL + this.player1.avatar" :alt="party.player1" class="w-8 m-auto">
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
          <img :src="this.baseURL + this.player2.avatar" :alt="party.player2" class="w-8 m-auto">
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
    </start-panel>

    <control-panel
      v-if="!loading"
      name="GomokuParty"
      ref="controlPanel"
      @firstMove="firstMove"
      @prevMove="prevMove"
      @nextMove="nextMove"
      @lastMove="lastMove"
    />
  </section>
</template>

<script>
import api from "../../api/index";
import ControlPanel from "../../components/gomoku/ControlPanel.vue";
import GomokuBoard from "../../components/gomoku/GomokuBoard.vue";
import StartPanel from "../../components/gomoku/StartPanel.vue";
import Loading from "../../components/interface/Loading.vue";
import { DateTime } from "luxon";

export default {
  components: { ControlPanel, GomokuBoard, StartPanel, Loading },
  data() {
    return {
      loading: true,
      currentColor: "white",
      party: {},
      player1: {},
      player2: {},
      moves: [],
      dotClassName: "dot rounded-full pointer text-center text-xs sm:text-base flex items-center justify-center"
    }
  },
  async mounted() {
    this.party = await api.gomoku.getParty(this.$route.params.id);
    this.player1 = await api.account.getUser(this.party.player1);
    this.player2 = await api.account.getUser(this.party.player2);
    this.loading = false;

    document.title = `${this.party.player1} VS. ${this.party.player2}`;
  },
  methods: {
    firstMove() {
      const firstMoveCoordinate = this.party.moves[0]["coordinate"];
      const firstDot = document.getElementById(firstMoveCoordinate);

      this.$refs.controlPanel.resetBoard();
      this.$refs.gomokuBoard.selectDot(firstDot);
    },
    prevMove() {
      if (this.loading || this.moves.length === 1) return;

      this.moves.pop();
      const penultDot = this.moves[this.moves.length - 1];
      const lastDot = document.querySelector(".border-yellow-500");
      penultDot.classList.add("border-yellow-500");
      lastDot.className = this.dotClassName;
      lastDot.innerHTML = "";

      if (this.currentColor === "white") this.currentColor = "blue";
      else this.currentColor = "white";
    },
    nextMove() {
      if (this.loading || this.moves.length === this.party.moves.length) return;

      const nextMoveCoordinate = this.party.moves[this.moves.length]["coordinate"];
      const nextMove = document.getElementById(nextMoveCoordinate);

      this.$refs.gomokuBoard.selectDot(nextMove);
    },
    lastMove() {
      this.$refs.gomokuBoard.selectPartyDots();
    },
    parseDate(date) {
      return DateTime.fromISO(date).setLocale("ru").toFormat("d MMMM y") + " г.";
    }
  }
}
</script>