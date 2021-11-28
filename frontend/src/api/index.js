import instance from "./instance";
import account from "./account";
import chat from "./chat";
import chess from "./chess";
import gomoku from "./gomoku";

export default {
  account: account(instance),
  chat: chat(instance),
  chess: chess(instance),
  gomoku: gomoku(instance),
}