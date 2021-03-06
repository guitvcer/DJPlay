import { createStore } from "vuex";
import account from "./modules/account/index";
import chat from "./modules/chat/index";
import chess from "./modules/chess/index";
import gomoku from "./modules/gomoku/index";

export default createStore({
  modules: {
    account, chat, chess, gomoku,
  },
})