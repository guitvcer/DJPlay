import store from "../store/index";

export default function(instance) {
  return {
    getGame() {
      return instance
        .get("/chess/")
        .then(response => response.data)
        .catch(error => store.commit("updateStatus", error.response.status));
    },
  }
}