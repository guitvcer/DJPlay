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
        @click="movePiece({ coordinate: selectedCell, pawnTo: piece.name})"
      >
        <img :src="pieceImageUrl + currentColor + '/' + piece.name + '.png'" :alt="piece.title">
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  data() {
    return {
      pieceImageUrl: this.host + '/media/chess/pieces/',
      pieces: [
        { name: "queen", title: "Ферзь" },
        { name: "knight", title: "Конь" },
        { name: "rook", title: "Ладья" },
        { name: "bishop", title: "Слон" }
      ],
    }
  },
  computed: mapGetters(["currentColor", "selectedCell"]),
  methods: mapActions(["movePiece"]),
}
</script>