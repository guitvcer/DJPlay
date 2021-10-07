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
      :class="['flex w-full items-center justify-around',
      $parent.currentColor === colors[1] ? 'flex-row-reverse' : 'flex-row']"
      style="height: 12.5%"
    >
      <div
        v-for="letter in letters"
        style="width: 11%; height: 88%;"
        class="flex items-center justify-center cell rounded"
        :id="letter + number"
        @click="boardCellOnClick"
      >
        <img
          v-if="$parent.pieces[letter + number] !== undefined"
          class="w-11/12 h-11/12"
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
        white: 1,
        black: 8
      },
      pawnY: {
        white: 2,
        black: 7
      },
      selectedPiece: null,
      newMoveSound: new Audio(`${this.host}/media/sounds/new_move.mp3`),
      getSelectableCellsForPieceMethod: {
        pawn: this.getSelectableCellsForPawn,
        rook: this.getSelectableCellsForRook,
        knight: this.getSelectableCellsForKnight,
        bishop: this.getSelectableCellsForBishop,
        queen: this.getSelectableCellsForQueen,
        king: this.getSelectableCellsForKing
      }
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
      for (const lastMoveCell of document.querySelectorAll('.last-move-cell'))
        lastMoveCell.classList.remove('last-move-cell')
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
    checkCellForEnemy(cell) {
      const piece = this.$parent.pieces[cell.id]
      return piece != null && piece.color !== this.$parent.currentColor
    },
    getSelectableCellsForPawn(cell) {
      let selectableCells = []
      const x = cell.id[0]
      const y = +cell.id[1]
      const leftX = this.letters[this.letters.indexOf(x) - 1]
      const rightX = this.letters[this.letters.indexOf(x) + 1]
      const frontY = this.$parent.currentColor === 'white' ? +cell.id[1] + 1 : +cell.id[1] - 1
      const frontY2 = this.$parent.currentColor === 'white' ? frontY + 1 : frontY - 1
      const selectableCellId = x + frontY

      if (this.$parent.pieces[selectableCellId] === undefined) {
        selectableCells.push(document.getElementById(selectableCellId))

        if (
          y === 2 && this.$parent.currentColor === 'white' ||
          y === 7 && this.$parent.currentColor === 'black'
        ) {
          const frontCell2Id = x + frontY2
          selectableCells.push(document.getElementById(frontCell2Id))
        }
      }

      let eatablePiece = this.$parent.pieces[leftX + frontY]
      if (eatablePiece !== undefined && eatablePiece.color !== this.$parent.currentColor)
        selectableCells.push(document.getElementById(eatablePiece.coordinate))

      eatablePiece = this.$parent.pieces[rightX + frontY]
      if (eatablePiece !== undefined && eatablePiece.color !== this.$parent.currentColor)
        selectableCells.push(document.getElementById(eatablePiece.coordinate))

      return selectableCells
    },
    checkCellByCoordinateForEmptiness(coordinate) {
      if (this.$parent.pieces[coordinate] == null) return 0
      else if (this.$parent.pieces[coordinate].color !== this.$parent.currentColor) return 1
      else return 2
    },
    getSelectableCellsForKnight(cell, color = this.$parent.currentColor) {
      const selectableCells = []

      for (let x = -2; x <= 2; x++) {
        if (x === 0) continue

        const yBegin = Math.abs(x) === 2 ? -1: -2
        const yEnd = -1 * yBegin

        for (let y = yBegin; y <= yEnd; y += 2) {
          if (y === 0) continue

          const selectableCellId = this.letters[this.letters.indexOf(cell.id[0]) + x] + (+cell.id[1] + y)
          if (
            this.$parent.pieces[selectableCellId] === undefined ||
            this.$parent.pieces[selectableCellId].color !== color
          ) {
            const selectableCell = document.getElementById(selectableCellId)
            if (selectableCell != null) selectableCells.push(selectableCell)
          }
        }
      }

      return selectableCells
    },
    getSelectablCellsByFormula(_formulas, cell) {
      const selectableCells = []
      const x = cell.id[0]
      const indexOfX = this.letters.indexOf(x)
      const y = +cell.id[1]
      let formulas = _formulas

      for (const direction in formulas) {
        const formula = formulas[direction]

        if (!formula) continue

        for (let n = 1; n <= 8; n++) {
          const coordinate = formula(indexOfX, y, n)
          const cell = document.getElementById(coordinate)
          const piece = this.$parent.pieces[coordinate]

          if (cell != null) {
            if (piece === undefined) selectableCells.push(cell)
            else if (piece.color !== this.$parent.currentColor) {
              selectableCells.push(cell)
              formulas[direction] = false
              break
            } else {
              formulas[direction] = false
              break
            }
          }
        }
      }

      return selectableCells
    },
    getSelectableCellsForRook(cell) {
      const verticalAndHorizontalFormulas = {
        'forward': (indexOfX, y, n) => this.letters[indexOfX + n] + y,
        'right': (indexOfX, y, n) => this.letters[indexOfX] + (y + n),
        'back': (indexOfX, y, n) => this.letters[indexOfX - n] + y,
        'left': (indexOfX, y, n) => this.letters[indexOfX] + (y - n)
      }

      return this.getSelectablCellsByFormula(verticalAndHorizontalFormulas, cell)
    },
    getSelectableCellsForBishop(cell) {
      const diagonalFormulas = {
        'topLeft': (indexOfX, y, n) => this.letters[indexOfX - n] + (y + n),
        'topRight': (indexOfX, y, n) => this.letters[indexOfX + n] + (y + n),
        'bottomRight': (indexOfX, y, n) => this.letters[indexOfX + n] + (y - n),
        'bottomLeft': (indexOfX, y, n) => this.letters[indexOfX - n] + (y - n)
      }

      return this.getSelectablCellsByFormula(diagonalFormulas, cell)
    },
    getSelectableCellsForQueen(cell) {
      const selectableCellsForRook = this.getSelectableCellsForRook(cell)
      const selectableCellsForBishop = this.getSelectableCellsForBishop(cell)
      return selectableCellsForRook.concat(selectableCellsForBishop)
    },
    getSelectableCellsForKing(cell) {
      let selectableCells = []
      const x = cell.id[0]
      const indexOfX = this.letters.indexOf(x)
      const y = +cell.id[1]

      for (let _indexOfX = indexOfX - 1; _indexOfX <= indexOfX + 1; _indexOfX++) {
        for (let _y = y - 1; _y <= y + 1; _y++) {
          const coordinate = this.letters[_indexOfX] + _y
          const cell = document.getElementById(coordinate)

          if (cell != null && !this.checkForCheck(cell)) {
            const piece = this.$parent.pieces[coordinate]
            if (piece == null || piece.color !== this.$parent.currentColor) {
              selectableCells.push(cell)
            }
          }
        }
      }

      for (const move of this.$parent.moves) {
        if (move.movedFrom === `e${this.pieceY[this.$parent.currentColor]}`) return selectableCells
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
        ) return selectableCells
      }

      if (
        this.$parent.pieces[`b${y}`] == null &&
        this.$parent.pieces[`c${y}`] == null &&
        this.$parent.pieces[`d${y}`] == null
      ) {
        const kingMoveToCell = document.getElementById(`c${y}`)
        kingMoveToCell.classList.add('castling-cell')
        selectableCells.push(kingMoveToCell)
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
          kingMoveToCell.classList.add('castling-cell')
          selectableCells.push(kingMoveToCell)
        }
      }

      return selectableCells
    },
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
    selectCell(cell) {
      if (this.checkCellForEnemy(cell))
        cell.classList.add('eatable-cell')
      else cell.classList.add('selected-cell')
    },
    selectCellsForPiece(cell, piece) {
      for (const selectableCell of this.getSelectableCellsForPieceMethod[piece.piece](cell)) {
        this.selectCell(selectableCell)
      }
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
  border: 2px dashed blue !important;
  cursor: pointer;
}
.eatable-cell {
  border: 2px dashed red !important;
  cursor: pointer;
}
.last-move-cell {
  border: 2px dashed green;
}
</style>