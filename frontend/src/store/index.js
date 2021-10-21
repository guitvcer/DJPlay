import { createStore } from "vuex";
import chess from "./modules/chess";

export default createStore({
  modules: {
    chess,
  }
});