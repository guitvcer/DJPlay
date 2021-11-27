import { createStore } from "vuex";
import account from "./modules/account";
import chess from "./modules/chess";

export default createStore({
  modules: {
    account, chess,
  },
})