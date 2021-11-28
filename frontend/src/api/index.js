import instance from "./instance";
import account from "./account";
import chat from "./chat";
import chess from "./chess";

export default {
  account: account(instance),
  chat: chat(instance),
  chess: chess(instance),
}