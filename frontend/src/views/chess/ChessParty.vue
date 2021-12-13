<template>
  <section
    class="flex flex-col-reverse 2xl:flex-row mx-auto justify-center 2xl:justify-between px-0 md:px-16"
    @keydown.ctrl.left="firstMove"
    @keydown.left="prevMove"
    @keydown.right="nextMove"
    @keydown.ctrl.right="lastMove"
  >
    <loading v-if="loading" class="m-auto" />
    <chess-board v-if="!loading" action="ChessParty" />

    <start-panel
      v-if="!loading"
      action="ChessParty"
    >
      <div class="mb-4 flex justify-between">
        <party-player :party="party" color="white" />
        <strong class="text-2xl md:text-4xl w-1/3 text-center pt-4">VS.</strong>
        <party-player :party="party" color="black" />
      </div>

      <p>
        <span class="mr-2">Количество ходов: </span>
        <span class="font-semibold">{{ party.moves.length }}</span>
      </p>
      <p>
        <span class="mr-2">Дата: </span>
        <span class="font-semibold">{{ parseDate(party.date) }}</span>
      </p>
    </start-panel>

    <control-panel v-if="!loading" action="ChessParty" />
  </section>
</template>

<script>
import { mapActions, mapMutations, mapGetters } from "vuex";
import Loading from "../../components/interface/Loading.vue";
import ControlPanel from "../../components/chess/ControlPanel.vue";
import ChessBoard from "../../components/chess/ChessBoard.vue";
import StartPanel from "../../components/chess/StartPanel.vue";
import PartyPlayer from "../../components/chess/PartyPlayer.vue";
import { onResizeBoard } from "../../utilities";
import { parseDate } from "../../scripts/account/profile.js";
import { GAME_STASUSES } from "../../scripts/chess/constants";

export default {
  data() {
    return {
      loading: true,
    }
  },
  components: { Loading, ControlPanel, ChessBoard, StartPanel, PartyPlayer },
  computed: mapGetters("chess", ["party", "gameStatus"]),
  methods: {
    ...mapActions("chess", [
      "loadParty",
      "setPartyPlayers",
      "firstMove",
      "prevMove",
      "nextMove",
      "lastMove",
    ]),
    ...mapMutations("chess", [
      "updateGameStatus",
      "closeChessPartySocket",
      "closeFindOpponentSocket",
    ]),
    onResizeBoard,
    parseDate,
  },
  async mounted() {
    if (this.gameStatus === GAME_STASUSES.FINDING) {
      this.closeFindOpponentSocket();
    } else if (this.gameStatus === GAME_STASUSES.ONLINE) {
      this.closeChessPartySocket();
    }

    this.updateGameStatus(GAME_STASUSES.WATCH);
    await this.loadParty();
    this.setPartyPlayers();
    this.lastMove();
    this.loading = false;
    this.onResizeBoard();

    document.title = `${this.party["white"].username} VS. ${this.party["black"].username}`;
  }
}
</script>