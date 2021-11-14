import { COLORS, LETTERS, PAWN_Y, PIECE_Y } from "./constants";

let id = 1;

function getPawns(color) {
  /* Вернуть объект из начальных пешек определенного цвета */

  let pawns = {};

  for (let pawnSerialNumber = 0; pawnSerialNumber < 8; pawnSerialNumber++) {
    const coordinate = LETTERS[pawnSerialNumber] + PAWN_Y[color];

    pawns[coordinate] =  {
      name: "pawn",
      coordinate: coordinate,
      image: `/media/chess/pieces/${color}/pawn.png`,
      color: color,
      id,
    }

    id++;
  }

  return pawns;
}

function getRooks(color) {
  /* Вернуть объект из начальных ладей определенного цвета */

  let rooks = {};

  for (let rookX = 0; rookX < 8; rookX += 7) {
    const coordinate = LETTERS[rookX] + PIECE_Y[color];

    rooks[coordinate] = {
      name: "rook",
      coordinate: coordinate,
      image: `/media/chess/pieces/${color}/rook.png`,
      color: color,
      id,
    }

    id++;
  }

  return rooks;
}

function getKnights(color) {
  /* Вернуть объект из начальных коней определенного цвета */

  let knights = {};

  for (let knightX = 1; knightX < 7; knightX += 5) {
    const coordinate = LETTERS[knightX] + PIECE_Y[color];

    knights[coordinate] = {
      name: "knight",
      coordinate: coordinate,
      image: `/media/chess/pieces/${color}/knight.png`,
      color: color,
      id,
    }

    id++;
  }

  return knights;
}

function getBishops(color) {
  /* Вернуть объект из начальныъ слонов определенного цвета */

  let bishops = {};

  for (let bishopX = 2; bishopX < 6; bishopX += 3) {
    const coordinate = LETTERS[bishopX] + PIECE_Y[color];

    bishops[coordinate] = {
      name: "bishop",
      coordinate: coordinate,
      image: `/media/chess/pieces/${color}/bishop.png`,
      color: color,
      id,
    }

    id++;
  }

  return bishops;
}

function getQueen(color) {
  /* Вернуть начальную ферзя определенного цвета */

  const coordinate = LETTERS[3] + PIECE_Y[color];
  const queen = {};

  queen[coordinate] = {
    name: "queen",
    coordinate: coordinate,
    image: `/media/chess/pieces/${color}/queen.png`,
    color: color,
    id,
  }

  id++;

  return queen;
}

function getKing(color) {
  /* Вернуть начального короля определенного цвета */

  const coordinate = LETTERS[4] + PIECE_Y[color];
  const king = {};

  king[coordinate] = {
    name: "king",
    coordinate: coordinate,
    image: `/media/chess/pieces/${color}/king.png`,
    color: color,
    id,
  }

  id++;

  return king;
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