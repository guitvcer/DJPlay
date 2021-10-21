import instance from "./instance"
import chessModule from "./chess"

export default {
  chess: chessModule(instance),
}