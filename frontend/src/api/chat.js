import store from "../store/index";

export default function(instance) {
  return {
    async getChats() {
      return await instance
        .get("/chat/")
        .then(response => response.data)
        .catch(error => store.commit("updateStatus", error.response.status));
    },
    async getChat(username) {
      return await instance
        .get("/chat/" + username)
        .then(response => response.data)
        .catch(error => store.commit("updateStatus", error.response.status));
    }
  }
}