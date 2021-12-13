<template>
  <div>
    <div class="p-6 pb-4 border-b dark:border-main">
      <h3 class="font-bold text-xl">Выберите фигуру для пешки</h3>
    </div>
    <div class="pt-4 pb-8 px-8 flex justify-between">
      <button
        v-for="piece in pieces"
        class="rounded border p-4 hover:bg-gray-50 dark:bg-main-dark dark:hover:bg-main dark:border-main mx-1"
        :title="piece.title"
        @click="transform(piece.name)"
      >
        <img
          class="w-16 h-16"
          :src="pieceImageUrl + currentColor + '/' + piece.name + '.svg'"
          :alt="piece.title"
        >
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapGetters } from "vuex";
import { parseNotation } from "../../scripts/chess/board";
import { GAME_STASUSES } from "../../scripts/chess/constants";

export default {
  data() {
    return {
      pieceImageUrl: this.baseURL + '/media/chess/pieces/',
      pieces: [
        { name: "queen", title: "Ферзь" },
        { name: "knight", title: "Конь" },
        { name: "rook", title: "Ладья" },
        { name: "bishop", title: "Слон" },
      ],
    }
  },
  computed: mapGetters("chess", ["currentColor", "selectedCell", "time", "gameStatus"]),
  methods: {
    ...mapActions("chess", ["movePiece"]),
    ...mapMutations("chess", ["sendChessPartySocket"]),
    transform(name) {
      if (this.gameStatus === GAME_STASUSES.ONLINE) {
        this.sendChessPartySocket({
          action: "make_move",
          time: this.time,
          notation: parseNotation(this.selectedCell) + "=" + name,
        });
      } else {
        this.movePiece({ coordinate: this.selectedCell, pawnTo: name });
      }
    },
  }
}
</script>