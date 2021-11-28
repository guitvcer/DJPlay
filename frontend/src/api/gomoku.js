import store from "../store/index";

export default function(instance) {
  return {
    async getGame() {
      return await instance
        .get("/gomoku/")
        .then(response => response.data)
        .catch(error => store.commit("updateStatus", error.response.status));
    },
    async getParty(id) {
      return await instance
        .get(`/gomoku/${id}/`)
        .then(response => response.data)
        .catch(error => store.commit("updateStatus", error.response.status));
    }
  }
}