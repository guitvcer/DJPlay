<template>
  <div
    :class="['max-w-3xl w-full mx-0 mx-auto 2xl:mx-4 mt-12 mb-20 md:mt-20 md:mb-10 2xl:mt-0 bg-chess-board flex ',
      currentColor === colors[0] ? 'flex-col-reverse' : 'flex-col'
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
        currentColor === colors[1] ? 'flex-row-reverse' : 'flex-row']"
      style="height: 12.5%"
    >
      <div
        v-for="letter in letters"
        style="width: 12.5%; height: 100%"
        class="flex items-center justify-center cell"
        :id="letter + number"
        @click="boardCellOnClick"
      >
        <img
          v-if="pieces[letter + number] !== undefined"
          class="w-10/12 h-10/12"
          :src="pieces[letter + number].image"
          :alt="pieces[letter + number].piece"
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
      pieces: {},
      colors: ['white', 'black'],
      pieceY: {
        'white': 1,
        'black': 8
      },
      pawnY: {
        'white': 2,
        'black': 7
      },
      currentColor: 'white',
      moveOf: 'white',
      selectedPiece: null,
      gameStatus: null
    }
  },
  mounted() {
    setTimeout(this.resizeChessBoard, 1)
    setTimeout(this.resizeChessBoard, 2)
    window.addEventListener('resize', this.resizeChessBoard)

    this.setInitialPieces()
  },
  methods: {
    focusToLeft() {},
    focusToDown() {},
    focusToUp() {},
    focusToRight() {},
    setPawns(color) {
      for (let pawnSerialNumber = 0; pawnSerialNumber < 8; pawnSerialNumber++) {
        const coordinate = `${this.letters[pawnSerialNumber]}${this.pawnY[color]}`
        this.pieces[coordinate] = {
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
        this.pieces[coordinate] = {
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
        this.pieces[coordinate] = {
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
        this.pieces[coordinate] = {
          piece: 'bishop',
          coordinate: coordinate,
          image: `${this.host}/media/chess/pieces/${color}/bishop.png`,
          color: color
        }
      }
    },
    setQueenAndKing(color) {
      const queenCoordinate = `${this.letters[3]}${this.pieceY[color]}`
      this.pieces[queenCoordinate] = {
        piece: 'queen',
        coordinate: queenCoordinate,
        image: `${this.host}/media/chess/pieces/${color}/queen.png`,
        color: color
      }

      const kingCoordinate = `${this.letters[4]}${this.pieceY[color]}`
      this.pieces[kingCoordinate] = {
        piece: 'king',
        coordinate: kingCoordinate,
        image: `${this.host}/media/chess/pieces/${color}/king.png`,
        color: color
      }
    },
    setInitialPieces() {
      for (const color of this.colors) {
        this.setPawns(color)
        this.setRooks(color)
        this.setKnights(color)
        this.setBishops(color)
        this.setQueenAndKing(color)
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

      this.selectedPiece = null
    },
    selectCellsForPawn(cell, piece) {
      const x = piece.coordinate[0]
      const leftX = this.letters[this.letters.indexOf(x) - 1]
      const rightX = this.letters[this.letters.indexOf(x) + 1]
      const frontY = this.currentColor === 'white' ? +piece.coordinate[1] + 1 : +piece.coordinate[1] - 1
      const frontY2 = this.currentColor === 'white' ? frontY + 1 : frontY - 1
      const selectableCellId = x + frontY

      if (this.pieces[selectableCellId] === undefined) {
        document.getElementById(selectableCellId).classList.add('selected-cell')

        if (
          +piece.coordinate[1] === 2 && this.currentColor === 'white' ||
          +piece.coordinate[1] === 7 && this.currentColor === 'black'
        ) {
          const frontCell2Id = x + frontY2
          document.getElementById(frontCell2Id).classList.add('selected-cell')
        }
      }

      let eatablePiece = this.pieces[leftX + frontY]
      if (eatablePiece !== undefined && eatablePiece.color !== this.currentColor)
        document.getElementById(eatablePiece.coordinate).classList.add('eatable-cell')

      eatablePiece = this.pieces[rightX + frontY]
      if (eatablePiece !== undefined && eatablePiece.color !== this.currentColor)
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
            if (this.pieces[selectableCellId] === undefined)
              document.getElementById(selectableCellId).classList.add('selected-cell')
            else if (this.pieces[selectableCellId].color !== this.currentColor)
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

        if (this.pieces[coordinate] == null)
          document.getElementById(coordinate).classList.add('selected-cell')
        else if (this.pieces[coordinate].color !== this.currentColor) {
          document.getElementById(coordinate).classList.add('eatable-cell')
          break
        } else break
      }
      for (let rearY = y - 1; rearY >= 1; rearY--) {
        const coordinate = x + rearY

        if (this.pieces[coordinate] == null)
          document.getElementById(coordinate).classList.add('selected-cell')
        else if (this.pieces[coordinate].color !== this.currentColor) {
          document.getElementById(coordinate).classList.add('eatable-cell')
          break
        } else break
      }
      for (let indexOfLeftX = indexOfX - 1; indexOfLeftX >= 0; indexOfLeftX--) {
        const coordinate = this.letters[indexOfLeftX] + y

        if (this.pieces[coordinate] == null)
          document.getElementById(coordinate).classList.add('selected-cell')
        else if (this.pieces[coordinate].color !== this.currentColor) {
          document.getElementById(coordinate).classList.add('eatable-cell')
          break
        } else break
      }
      for (let indexOfRightX = indexOfX + 1; indexOfRightX <= 7; indexOfRightX++) {
        const coordinate = this.letters[indexOfRightX] + y

        if (this.pieces[coordinate] == null)
          document.getElementById(coordinate).classList.add('selected-cell')
        else if (this.pieces[coordinate].color !== this.currentColor) {
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
          const piece = this.pieces[coordinate]

          if (piece == null) {
            cell.classList.add('selected-cell')
          } else if (piece.color !== this.currentColor) {
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
          const piece = this.pieces[coordinate]

          if (piece == null) {
            cell.classList.add('selected-cell')
          } else if (piece.color !== this.currentColor) {
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
          const piece = this.pieces[coordinate]

          if (piece == null) {
            cell.classList.add('selected-cell')
          } else if (piece.color !== this.currentColor) {
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
          const piece = this.pieces[coordinate]

          if (piece == null) {
            cell.classList.add('selected-cell')
          } else if (piece.color !== this.currentColor) {
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
            const piece = this.pieces[coordinate]

            if (piece == null) {
              cell.classList.add('selected-cell')
            } else if (piece.color !== this.currentColor) {
              cell.classList.add('eatable-cell')
            }
          } catch (e) {}
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
    moveOrEatPiece(newCell, piece) {
      this.moveOf = this.currentColor === 'white' ? 'black': 'white'

      if (this.gameStatus === null) {
        this.currentColor = this.moveOf
      }

      this.selectedPiece = null
      this.pieces[piece.coordinate] = undefined
      piece.coordinate = newCell.id
      this.pieces[newCell.id] = piece
      this.unselectAllPieces()
    },
    boardCellOnClick(event) {
      if (this.moveOf !== this.currentColor) return

      const cell = event.target.closest('.cell')
      const pieceImg = cell.children[0] !== undefined ? cell.children[0] : null
      const piece = pieceImg ? this.pieces[cell.id] : null


      if (this.selectedPiece == null && piece != null) {
        // Выбор фигуры

        if (this.currentColor !== piece.color) return

        this.selectPiece(cell, piece)
        this.selectCellsForPiece(cell, piece)
      } else if (this.selectedPiece != null && this.selectedPiece === piece) {
        // Отменить выбор фигуры

        this.unselectAllPieces()
      } else if (
        this.selectedPiece != null &&
        this.selectedPiece !== piece &&
        piece != null &&
        piece.color === this.currentColor &&
        !cell.classList.contains('selected-cell')
      ) {
        // Отменить выбор текущей фигуры и выбрать другую фигуру
        this.unselectAllPieces()
        this.selectPiece(cell, piece)
        this.selectCellsForPiece(cell, piece)
      } else if (this.selectedPiece != null && cell.classList.contains('selected-cell') ||
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
  border: 2px solid blue;
}
.eatable-cell {
  border: 2px solid red;
}
</style>