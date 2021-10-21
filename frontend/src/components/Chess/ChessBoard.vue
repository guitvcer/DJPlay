<template>
  <div
    :class="[
      'max-w-3xl w-full mx-0 mx-auto 2xl:mx-4 mt-12 mb-20 md:mt-20 md:mb-10 2xl:mt-0 bg-chess-board flex flex-wrap ',
      currentColor !== WHITE ? 'flex-row-reverse' : 'flex-row'
    ]"
    id="chessBoard"
  >
    <div
      v-for="coordinate in Object.keys(field)"
      @click="boardCellOnClick"
      :id="coordinate"
      :class="[
        'flex items-center justify-center cell rounded',
        ' edible-piece' ? pieces[coordinate] && pieces[coordinate].edible!== undefined : '',
        ' selectable-cell' ? field[coordinate].selectable : '',
        ' last-move-cell' ? field[coordinate].last : ''
      ]"
      style="width: 12.5%; height: 12.5%"
    >
      <img
        v-if="pieces[coordinate] !== undefined"
        :src="pieces[coordinate].image"
        :alt="pieces[coordinate].piece"
        class="w-11/12 h-11/12"
      >
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { COLORS, WHITE } from "../../scripts/chess/constants";
import { resizeChessBoard } from "../../scripts/chess/board";

export default {
  data() {
    return { COLORS, WHITE };
  },
  mounted() {
    setTimeout(resizeChessBoard, 1)
    setTimeout(resizeChessBoard, 2)
    window.addEventListener('resize', resizeChessBoard)

    this.clearAndSetInitialPieces()
  },
  computed: mapGetters(["pieces", "field", "currentColor"]),
  methods: {
    ...mapActions([
      "clearAndSetInitialPieces",
    ]),
    checkForCheck(cell) {
      for (const piece in this.getSelectableCellsForPieceMethod) {
        if (piece !== 'king') {
          for (const selectableCell of this.getSelectableCellsForPieceMethod[piece](cell)) {
            const pieceOfSelectableCell = this.$parent.pieces[selectableCell.id]
            if (
              pieceOfSelectableCell !== undefined &&
              pieceOfSelectableCell.piece === piece &&
              pieceOfSelectableCell.color !== this.$parent.currentColor
            ) return true
          }
        }
      }

      return false
    },
    moveOrEatPiece(movedToCell, piece) {
      for (let lastMoveCell of document.querySelectorAll('.last-move-cell'))
        lastMoveCell.classList.remove('last-move-cell')

      if (movedToCell.classList.contains('castling-cell')) {
        const y = this.pieceY[this.$parent.currentColor]
        let rook

        this.unselectAllPieces()

        if (movedToCell.id[0] === 'c') {
          this.$parent.moves.push({
            longCastling: true,
            color: this.$parent.currentColor
          })

          rook = this.$parent.pieces[`a${y}`]
          document.getElementById(rook.coordinate).classList.add('last-move-cell')
          this.$parent.pieces[rook.coordinate] = undefined
          rook.coordinate = `d${y}`
          this.$parent.pieces[`d${y}`] = rook
        } else if (movedToCell.id[0] === 'g') {
          this.$parent.moves.push({
            shortCastling: true,
            color: this.$parent.currentColor
          })

          rook = this.$parent.pieces[`h${y}`]
          document.getElementById(rook.coordinate).classList.add('last-move-cell')
          this.$parent.pieces[rook.coordinate] = undefined
          rook.coordinate = `f${y}`
          this.$parent.pieces[rook.coordinate] = rook
        }

        document.getElementById(piece.coordinate).classList.add('last-move-cell')

        this.$parent.pieces[piece.coordinate] = undefined
        piece.coordinate = movedToCell.id
        this.$parent.pieces[piece.coordinate] = piece
      } else {
        if (this.$parent.pieces[movedToCell.id] !== null) {
          this.$parent.moves.push({
            piece: piece.piece,
            movedFrom: piece.coordinate,
            movedTo: movedToCell.id,
            eatenPiece: this.$parent.pieces[movedToCell.id]
          })
        } else {
          this.$parent.moves.push({
            piece: piece.piece,
            movedFrom: piece.coordinate,
            movedTo: movedToCell.id
          })
        }

        this.unselectAllPieces()

        document.getElementById(piece.coordinate).classList.add('last-move-cell')
        movedToCell.classList.add('last-move-cell')

        this.selectedPiece = null
        this.$parent.pieces[piece.coordinate] = undefined
        piece.coordinate = movedToCell.id
        this.$parent.pieces[movedToCell.id] = piece
      }

      this.$parent.moveOf = this.$parent.currentColor === 'white' ? 'black': 'white'

      if (this.$parent.gameStatus === null) {
        this.$parent.currentColor = this.$parent.moveOf
      }

      this.newMoveSound.currentTime = 0
      this.newMoveSound.play()
    },
    boardCellOnClick(event) {
      if (this.$parent.moveOf !== this.$parent.currentColor) return

      const cell = event.target.closest('.cell')
      const pieceImg = cell.children[0] !== undefined ? cell.children[0] : null
      const piece = pieceImg ? this.$parent.pieces[cell.id] : null

      if (this.selectedPiece == null && piece != null) {
        // Выбор фигуры

        if (this.$parent.currentColor !== piece.color) return

        this.selectPiece(cell, piece)
        this.selectCellsForPiece(cell, piece)
      } else if (this.selectedPiece != null && this.selectedPiece === piece) {
        // Отменить выбор фигуры

        this.unselectAllPieces()
      } else if (
        this.selectedPiece != null &&
        this.selectedPiece !== piece &&
        piece != null &&
        piece.color === this.$parent.currentColor &&
        !cell.classList.contains('selected-cell')
      ) {
        // Отменить выбор текущей фигуры и выбрать другую фигуру
        this.unselectAllPieces()
        this.selectPiece(cell, piece)
        this.selectCellsForPiece(cell, piece)
      } else if (
        this.selectedPiece != null && cell.classList.contains('selected-cell') ||
        cell.classList.contains('eatable-cell')
      ) {
        this.moveOrEatPiece(cell, this.selectedPiece)
      }
    },
  }
}
</script>

<style>
.selectable-cell {
  border: 2px dashed blue !important;
  cursor: pointer;
}
.edible-piece {
  border: 2px dashed red !important;
  cursor: pointer;
}
.last-move-cell {
  border: 2px dashed green;
}
</style>