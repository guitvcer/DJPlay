<template>
  <section
    class="flex flex-col-reverse 2xl:flex-row mx-auto justify-center 2xl:justify-between px-0 md:px-16"
    style="max-width: 1800px;"
  >
    <loading v-if="loading" class="m-auto" />
    <chess-board v-if="!loading" action="Chess" />
    <start-panel v-if="!loading" action="Chess">
      <h2 class="text-2xl md:text-4xl mb-4">{{ game.name }}</h2>
      <p class="mb-12 md:mb-20" v-html="game.rules"></p>
    </start-panel>
    <control-panel v-if="!loading" action="Chess" />
  </section>
</template>

<script>
import { mapActions, mapMutations, mapGetters } from "vuex";
import Loading from "../../components/interface/Loading.vue";
import ChessBoard from "../../components/chess/ChessBoard.vue";
import StartPanel from "../../components/chess/StartPanel.vue";
import ControlPanel from "../../components/chess/ControlPanel.vue";
import { GAME_STASUSES } from "../../scripts/chess/constants";

export default {
  components: {
    Loading, ChessBoard, StartPanel, ControlPanel,
  },
  async mounted() {
    if (this.gameStatus === GAME_STASUSES.WATCH) {
      this.updateGameStatus(null);
      this.resetBoard();
    }

    await this.loadChess();

    document.title = "Шахматы - DJPlay";
  },
  methods: {
    ...mapActions("chess", ["loadChess", "resetBoard"]),
    ...mapMutations("chess", ["updateGameStatus"]),
  },
  computed: mapGetters("chess", ["game", "loading", "gameStatus"]),
}
</script>