import { createStore } from "vuex";
import account from "./modules/account";
import chat from "./modules/chat";
import chess from "./modules/chess";
import gomoku from "./modules/gomoku/index";

export default createStore({
  modules: {
    account, chat, chess, gomoku,
  },
})