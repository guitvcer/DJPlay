<template>
  <section
    class="flex flex-col-reverse 2xl:flex-row mx-auto justify-center 2xl:justify-between px-0 md:px-16"
    style="max-width: 1800px"
  >
    <loading v-if="loading" class="m-auto" />
    <chess-board v-if="!loading" ref="chessBoard" name="Chess" />
    <start-panel
      v-if="!loading"
      name="Chess"
      :game="game"
      @find-opponent="findOpponent"
      @cancel-finding="cancelFinding"
      @give-up="giveUp"
    >
      <h2 class="text-2xl md:text-4xl mb-4">{{ game.name }}</h2>
      <p class="mb-12 md:mb-20" v-html="game.rules"></p>
    </start-panel>
    <control-panel v-if="!loading" ref="controlPanel" name="Chess" />
  </section>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import Loading from "../../components/Interface/Loading";
import ChessBoard from "../../components/Chess/ChessBoard";
import StartPanel from "../../components/Chess/StartPanel";
import ControlPanel from "../../components/Chess/ControlPanel";

export default {
  components: {
    Loading, ChessBoard, StartPanel, ControlPanel,
  },
  async mounted() {
    await this.loadChess();
  },
  methods: {
    ...mapActions(["loadChess"]),
    findOpponent() {},
    cancelFinding() {},
    giveUp() {},
    offerDraw() {}
  },
  computed: mapGetters(["game", "loading"]),
}
</script>