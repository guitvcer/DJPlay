<template>
  <section
    class="flex flex-col-reverse 2xl:flex-row mx-auto justify-center 2xl:justify-between px-0 md:px-16"
    style="max-width: 1800px"
  >
    <loading v-if="loading" class="m-auto" />
    <gomoku-board v-if="!loading" action="Gomoku" />
    <start-panel v-if="!loading" action="Gomoku" :game="game">
      <h2 class="text-2xl md:text-4xl mb-4">{{ game.name }}</h2>
      <p class="mb-12 md:mb-20">{{ game.rules }}</p>
    </start-panel>
    <control-panel v-if="!loading" action="Gomoku" />
  </section>
</template>

<script>
import { mapActions, mapMutations, mapGetters } from "vuex";
import Loading from "../../components/interface/Loading.vue";
import ControlPanel from "../../components/gomoku/ControlPanel.vue";
import GomokuBoard from "../../components/gomoku/GomokuBoard.vue";
import StartPanel from "../../components/gomoku/StartPanel.vue";
import { GAME_STASUSES } from "../../scripts/gomoku/constants";

export default {
  components: { ControlPanel, GomokuBoard, StartPanel, Loading },
  async mounted() {
    if (this.gameStatus === GAME_STASUSES.WATCH) {
      this.resetBoard();
      this.updateGameStatus(GAME_STASUSES.OFFLINE);
    }

    await this.loadGame();

    document.title = "Гомоку - DJPlay";
  },
  computed: mapGetters("gomoku", ["game", "loading"]),
  methods: {
    ...mapActions("gomoku", ["loadGame", "resetBoard"]),
    ...mapMutations("gomoku", ["updateGameStatus"]),
  }
}
</script>