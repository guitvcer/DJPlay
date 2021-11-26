import { createStore } from "vuex";
import djplay from "./modules/djplay";
import chess from "./modules/chess";

export default createStore({
  modules: {
    djplay, chess,
  },
})