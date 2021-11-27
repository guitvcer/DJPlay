import instance from "./instance";
import chess from "./chess";
import account from "./account";

export default {
  chess: chess(instance),
  account: account(instance),
}