import { COLORS, LETTERS, PAWN_Y, PIECE_Y } from "./constants";

function getPawns(color) {
  /* Вернуть объект из начальных пешек определенного цвета */

  let pawns = {};

  for (let pawnSerialNumber = 0; pawnSerialNumber < 8; pawnSerialNumber++) {
    const coordinate = LETTERS[pawnSerialNumber] + PAWN_Y[color];

    pawns[coordinate] =  {
      piece: "pawn",
      coordinate: coordinate,
      image: `/media/chess/pieces/${color}/pawn.png`,
      color: color,
    }
  }

  return pawns;
}

function getRooks(color) {
  /* Вернуть объект из начальных ладей определенного цвета */

  let rooks = {};

  for (let rookX = 0; rookX < 8; rookX += 7) {
    const coordinate = LETTERS[rookX] + PIECE_Y[color];

    rooks[coordinate] = {
      piece: "rook",
      coordinate: coordinate,
      image: `/media/chess/pieces/${color}/rook.png`,
      color: color,
    }
  }

  return rooks;
}

function getKnights(color) {
  /* Вернуть объект из начальных коней определенного цвета */

  let knights = {};

  for (let knightX = 1; knightX < 7; knightX += 5) {
    const coordinate = LETTERS[knightX] + PIECE_Y[color];

    knights[coordinate] = {
      piece: "knight",
      coordinate: coordinate,
      image: `/media/chess/pieces/${color}/knight.png`,
      color: color,
    }
  }

  return knights;
}

function getBishops(color) {
  /* Вернуть объект из начальныъ слонов определенного цвета */

  let bishops = {};

  for (let bishopX = 2; bishopX < 6; bishopX += 3) {
    const coordinate = LETTERS[bishopX] + PIECE_Y[color];

    bishops[coordinate] = {
      piece: "bishop",
      coordinate: coordinate,
      image: `/media/chess/pieces/${color}/bishop.png`,
      color: color,
    }
  }

  return bishops;
}

function getQueen(color) {
  /* Вернуть начальную ферзя определенного цвета */

  const coordinate = LETTERS[3] + PIECE_Y[color];
  const queen = {
    piece: "queen",
    coordinate: coordinate,
    image: `/media/chess/pieces/${color}/queen.png`,
    color: color,
  }

  return { coordinate: queen };
}

function getKing(color) {
  /* Вернуть начального короля определенного цвета */

  const coordinate = LETTERS[4] + PIECE_Y[color];
  const king = {
    piece: "king",
    coordinate: coordinate,
    image: `/media/chess/pieces/${color}/king.png`,
    color: color,
  }

  return { coordinate: king };
}

function getPieces() {
  /* Вернуть объект из всех начальных фигур */

  let pieces = {};

  for (const color of COLORS)  {
    const pawns = getPawns(color);
    const rooks = getRooks(color);
    const knights = getKnights(color);
    const bishops = getBishops(color);
    const queen = getQueen(color);
    const king = getKing(color);

    pieces = Object.assign(pieces, pawns, rooks, knights, bishops, queen, king);
  }

  return pieces;
}

export default getPieces();