<template>
  <div
    :class="['max-w-3xl w-full mx-0 mx-auto 2xl:mx-4 mt-12 mb-20 md:mt-20 md:mb-10 2xl:mt-0 bg-chess-board flex ',
    $parent.currentColor === colors[0] ? 'flex-col-reverse' : 'flex-col'
  ]"
    id="chessBoard"
    @keydown.left="focusToLeft"
    @keydown.down="focusToDown"
    @keydown.up="focusToUp"
    @keydown.right="focusToRight"
  >
    <div
      v-for="number in numbers"
      :class="['flex w-full ',
      $parent.currentColor === colors[1] ? 'flex-row-reverse' : 'flex-row']"
      style="height: 12.5%"
    >
      <div
        v-for="letter in letters"
        style="width: 12.5%; height: 100%"
        class="flex items-center justify-center cell rounded-3xl"
        :id="letter + number"
        @click="boardCellOnClick"
      >
        <img
          v-if="$parent.pieces[letter + number] !== undefined"
          class="w-10/12 h-10/12"
          :src="$parent.pieces[letter + number].image"
          :alt="$parent.pieces[letter + number].piece"
        >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      numbers: [1, 2, 3, 4, 5, 6, 7, 8],
      letters: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
      colors: ['white', 'black'],
      pieceY: {
        'white': 1,
        'black': 8
      },
      pawnY: {
        'white': 2,
        'black': 7
      },
      selectedPiece: null,
      newMoveSound: new Audio(`${this.host}/media/sounds/new_move.mp3`)
    }
  },
  mounted() {
    setTimeout(this.resizeChessBoard, 1)
    setTimeout(this.resizeChessBoard, 2)
    window.addEventListener('resize', this.resizeChessBoard)

    this.clearAndSetInitialPieces()
  },
  methods: {
    focusToLeft() {},
    focusToDown() {},
    focusToUp() {},
    focusToRight() {},
    setPawns(color) {
      for (let pawnSerialNumber = 0; pawnSerialNumber < 8; pawnSerialNumber++) {
        const coordinate = `${this.letters[pawnSerialNumber]}${this.pawnY[color]}`
        this.$parent.pieces[coordinate] = {
          piece: 'pawn',
          coordinate: coordinate,
          image: `${this.host}/media/chess/pieces/${color}/pawn.png`,
          color: color
        }
      }
    },
    setRooks(color) {
      for (let rookX = 0; rookX < 8; rookX += 7) {
        const coordinate = `${this.letters[rookX]}${this.pieceY[color]}`
        this.$parent.pieces[coordinate] = {
          piece: 'rook',
          coordinate: coordinate,
          image: `${this.host}/media/chess/pieces/${color}/rook.png`,
          color: color
        }
      }
    },
    setKnights(color) {
      for (let knightX = 1; knightX < 7; knightX += 5) {
        const coordinate = `${this.letters[knightX]}${this.pieceY[color]}`
        this.$parent.pieces[coordinate] = {
          piece: 'knight',
          coordinate: coordinate,
          image: `${this.host}/media/chess/pieces/${color}/knight.png`,
          color: color
        }
      }
    },
    setBishops(color) {
      for (let bishopX = 2; bishopX < 6; bishopX += 3) {
        const coordinate = `${this.letters[bishopX]}${this.pieceY[color]}`
        this.$parent.pieces[coordinate] = {
          piece: 'bishop',
          coordinate: coordinate,
          image: `${this.host}/media/chess/pieces/${color}/bishop.png`,
          color: color
        }
      }
    },
    setQueenAndKing(color) {
      const queenCoordinate = `${this.letters[3]}${this.pieceY[color]}`
      this.$parent.pieces[queenCoordinate] = {
        piece: 'queen',
        coordinate: queenCoordinate,
        image: `${this.host}/media/chess/pieces/${color}/queen.png`,
        color: color
      }

      const kingCoordinate = `${this.letters[4]}${this.pieceY[color]}`
      this.$parent.pieces[kingCoordinate] = {
        piece: 'king',
        coordinate: kingCoordinate,
        image: `${this.host}/media/chess/pieces/${color}/king.png`,
        color: color
      }
    },
    clearAndSetInitialPieces(color = 'white') {
      this.unselectAllPieces()
      this.$parent.moves = []
      this.$parent.pieces = []
      this.$parent.moveOf = 'white'
      this.$parent.currentColor = color

      for (const color of this.colors) {
        this.setPawns(color)
        this.setRooks(color)
        this.setKnights(color)
        this.setBishops(color)
        this.setQueenAndKing(color)
      }
      for (const lastMoveCell of document.querySelectorAll('.last-move-cell')) {
        lastMoveCell.classList.remove('last-move-cell')
      }
    },
    selectPiece(cell, piece) {
      cell.classList.add('selected-cell')
      this.selectedPiece = piece
    },
    unselectAllPieces() {
      for (const selectedCell of document.querySelectorAll('.selected-cell'))
        selectedCell.classList.remove('selected-cell')

      for (const eatableCell of document.querySelectorAll('.eatable-cell'))
        eatableCell.classList.remove('eatable-cell')

      for (const castlingCell of document.querySelectorAll('.castling-cell'))
        castlingCell.classList.remove('castling-cell')

      this.selectedPiece = null
    },
    selectCellsForPawn(cell, piece) {
      const x = piece.coordinate[0]
      const leftX = this.letters[this.letters.indexOf(x) - 1]
      const rightX = this.letters[this.letters.indexOf(x) + 1]
      const frontY = this.$parent.currentColor === 'white' ? +piece.coordinate[1] + 1 : +piece.coordinate[1] - 1
      const frontY2 = this.$parent.currentColor === 'white' ? frontY + 1 : frontY - 1
      const selectableCellId = x + frontY

      if (this.$parent.pieces[selectableCellId] === undefined) {
        document.getElementById(selectableCellId).classList.add('selected-cell')

        if (
          +piece.coordinate[1] === 2 && this.$parent.currentColor === 'white' ||
          +piece.coordinate[1] === 7 && this.$parent.currentColor === 'black'
        ) {
          const frontCell2Id = x + frontY2
          document.getElementById(frontCell2Id).classList.add('selected-cell')
        }
      }

      let eatablePiece = this.$parent.pieces[leftX + frontY]
      if (eatablePiece !== undefined && eatablePiece.color !== this.$parent.currentColor)
        document.getElementById(eatablePiece.coordinate).classList.add('eatable-cell')

      eatablePiece = this.$parent.pieces[rightX + frontY]
      if (eatablePiece !== undefined && eatablePiece.color !== this.$parent.currentColor)
        document.getElementById(eatablePiece.coordinate).classList.add('eatable-cell')
    },
    selectCellsForKnight(cell, piece) {
      for (let x = -2; x <= 2; x++) {
        if (x === 0) continue

        const yBegin = Math.abs(x) === 2 ? -1: -2
        const yEnd = -1 * yBegin

        for (let y = yBegin; y <= yEnd; y += 2) {
          if (y === 0) continue

          const selectableCellId = this.letters[this.letters.indexOf(piece.coordinate[0]) + x] + (+piece.coordinate[1] + y)
          try {
            if (this.$parent.pieces[selectableCellId] === undefined)
              document.getElementById(selectableCellId).classList.add('selected-cell')
            else if (this.$parent.pieces[selectableCellId].color !== this.$parent.currentColor)
              document.getElementById(selectableCellId).classList.add('eatable-cell')
          } catch(e) {}
        }
      }
    },
    selectCellsForRook(cell, piece) {
      const x = piece.coordinate[0]
      const indexOfX = this.letters.indexOf(x)
      const y = +piece.coordinate[1]

      for (let frontY = y + 1; frontY <= 8; frontY++) {
        const coordinate = x + frontY

        if (this.$parent.pieces[coordinate] == null)
          document.getElementById(coordinate).classList.add('selected-cell')
        else if (this.$parent.pieces[coordinate].color !== this.$parent.currentColor) {
          document.getElementById(coordinate).classList.add('eatable-cell')
          break
        } else break
      }
      for (let rearY = y - 1; rearY >= 1; rearY--) {
        const coordinate = x + rearY

        if (this.$parent.pieces[coordinate] == null)
          document.getElementById(coordinate).classList.add('selected-cell')
        else if (this.$parent.pieces[coordinate].color !== this.$parent.currentColor) {
          document.getElementById(coordinate).classList.add('eatable-cell')
          break
        } else break
      }
      for (let indexOfLeftX = indexOfX - 1; indexOfLeftX >= 0; indexOfLeftX--) {
        const coordinate = this.letters[indexOfLeftX] + y

        if (this.$parent.pieces[coordinate] == null)
          document.getElementById(coordinate).classList.add('selected-cell')
        else if (this.$parent.pieces[coordinate].color !== this.$parent.currentColor) {
          document.getElementById(coordinate).classList.add('eatable-cell')
          break
        } else break
      }
      for (let indexOfRightX = indexOfX + 1; indexOfRightX <= 7; indexOfRightX++) {
        const coordinate = this.letters[indexOfRightX] + y

        if (this.$parent.pieces[coordinate] == null)
          document.getElementById(coordinate).classList.add('selected-cell')
        else if (this.$parent.pieces[coordinate].color !== this.$parent.currentColor) {
          document.getElementById(coordinate).classList.add('eatable-cell')
          break
        } else break
      }
    },
    selectCellsForBishop(cell, piece) {
      const x = piece.coordinate[0]
      const indexOfX = this.letters.indexOf(x)
      const y = +piece.coordinate[1]

      for (let n = 1; n <= 8; n++) {
        try {
          const coordinate = this.letters[indexOfX + n] + (y + n)
          const cell = document.getElementById(coordinate)
          const piece = this.$parent.pieces[coordinate]

          if (piece == null) {
            cell.classList.add('selected-cell')
          } else if (piece.color !== this.$parent.currentColor) {
            cell.classList.add('eatable-cell')
            break
          } else break
        } catch (e) {
          break
        }
      }
      for (let n = 1; n <= 8; n++) {
        try {
          const coordinate = this.letters[indexOfX - n] + (y - n)
          const cell = document.getElementById(coordinate)
          const piece = this.$parent.pieces[coordinate]

          if (piece == null) {
            cell.classList.add('selected-cell')
          } else if (piece.color !== this.$parent.currentColor) {
            cell.classList.add('eatable-cell')
            break
          } else break
        } catch (e) {
          break
        }
      }
      for (let n = 1; n <= 8; n++) {
        try {
          const coordinate = this.letters[indexOfX + n] + (y - n)
          const cell = document.getElementById(coordinate)
          const piece = this.$parent.pieces[coordinate]

          if (piece == null) {
            cell.classList.add('selected-cell')
          } else if (piece.color !== this.$parent.currentColor) {
            cell.classList.add('eatable-cell')
            break
          } else break
        } catch (e) {
          break
        }
      }
      for (let n = 1; n <= 8; n++) {
        try {
          const coordinate = this.letters[indexOfX - n] + (y + n)
          const cell = document.getElementById(coordinate)
          const piece = this.$parent.pieces[coordinate]

          if (piece == null) {
            cell.classList.add('selected-cell')
          } else if (piece.color !== this.$parent.currentColor) {
            cell.classList.add('eatable-cell')
            break
          } else break
        } catch (e) {
          break
        }
      }
    },
    selectCellsForQueen(cell, piece) {
      this.selectCellsForRook(cell, piece)
      this.selectCellsForBishop(cell, piece)
    },
    selectCellsForKing(cell, piece) {
      const x = piece.coordinate[0]
      const indexOfX = this.letters.indexOf(x)
      const y = +piece.coordinate[1]

      for (let _indexOfX = indexOfX - 1; _indexOfX <= indexOfX + 1; _indexOfX++) {
        for (let _y = y - 1; _y <= y + 1; _y++) {
          try {
            const coordinate = this.letters[_indexOfX] + _y
            const cell = document.getElementById(coordinate)
            const piece = this.$parent.pieces[coordinate]

            if (piece == null) {
              cell.classList.add('selected-cell')
            } else if (piece.color !== this.$parent.currentColor) {
              cell.classList.add('eatable-cell')
            }
          } catch (e) {}
        }
      }

      for (const move of this.$parent.moves) {
        if (move.movedFrom === `e${y}`) return
      }

      for (const move of this.$parent.moves) {
        const rookCoordinate = `a${y}`

        if (
          move.movedFrom === rookCoordinate ||
          move.movedTo === rookCoordinate ||
          (
            move.color === this.$parent.currentColor &&
            (move.longCastling || move.shortCastling)
          )
        ) return
      }

      if (
        this.$parent.pieces[`b${y}`] == null &&
        this.$parent.pieces[`c${y}`] == null &&
        this.$parent.pieces[`d${y}`] == null
      ) {
        const kingMoveToCell = document.getElementById(`c${y}`)
        kingMoveToCell.classList.add('selected-cell')
        kingMoveToCell.classList.add('castling-cell')
      }

      let didSecondRookMove = false
      for (const move of this.$parent.moves) {
        const rookCoordinate = `h${y}`

        if (move.movedFrom === rookCoordinate || move.movedTo === rookCoordinate) {
          didSecondRookMove = true
          break
        }
      }

      if (!didSecondRookMove) {
        if (
          this.$parent.pieces[`f${y}`] == null &&
          this.$parent.pieces[`g${y}`] == null
        ) {
          const kingMoveToCell = document.getElementById(`g${y}`)
          kingMoveToCell.classList.add('selected-cell')
          kingMoveToCell.classList.add('castling-cell')
        }
      }
    },
    selectCellsForPiece(cell, piece) {
      if (piece.piece === 'pawn') {
        this.selectCellsForPawn(cell, piece)
      } else if (piece.piece === 'knight') {
        this.selectCellsForKnight(cell, piece)
      } else if (piece.piece === 'rook') {
        this.selectCellsForRook(cell, piece)
      } else if (piece.piece === 'bishop') {
        this.selectCellsForBishop(cell, piece)
      } else if (piece.piece === 'queen') {
        this.selectCellsForQueen(cell, piece)
      } else if (piece.piece === 'king') {
        this.selectCellsForKing(cell, piece)
      }
    },
    moveOrEatPiece(movedToCell, piece) {
      for (let lastMoveCell of document.querySelectorAll('.last-move-cell')) {
        lastMoveCell.classList.remove('last-move-cell')
      }

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
        this.$parent.moves.push({
          piece: piece.piece,
          movedFrom: piece.coordinate,
          movedTo: movedToCell.id
        })

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
    resizeChessBoard() {
      try {
        const chessBoard = document.querySelector('#chessBoard')
        chessBoard.setAttribute('style',
            'height: ' + chessBoard.offsetWidth + 'px'
        )
      } catch (e) {}
    },
  }
}
</script>

<style>
.selected-cell {
  border: 2px dashed blue;
}
.eatable-cell {
  border: 2px dashed red;
}
.last-move-cell {
  border: 2px dashed orange;
}
</style>