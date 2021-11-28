import { chatSocketOnMessage, chatSocketOnOpen, isAuthenticated } from "../../utilities";

export default {
  actions: {
    async openChatSocket({ commit }) {
      if (await isAuthenticated()) {
        commit("updateChatSocket", new WebSocket(process.env.VUE_APP_BASE_WS_URL + "/ws"));
        commit("updateChatSocketOnOpen", chatSocketOnOpen);
        commit("updateChatSocketOnMessage", chatSocketOnMessage);
      }
    },
    closeChatSocket({ getters }) {
      if (getters.chatSocket) {
        getters.chatSocket.close();
      }
    }
  },
  mutations: {
    updateChatSocket(state, socket) {
      state.chatSocket = socket;
    },
    updateChatSocketOnOpen(state, func) {
      state.chatSocket.onopen = func;
    },
    updateChatSocketOnMessage(state, func) {
      state.chatSocket.onmessage = func;
    },
    chatSocketSend(state, object) {
      state.chatSocket.send(JSON.stringify(object));
    },

    updateMessageSoundTime(seconds) {
      state.messageSound = seconds;
    }
  },
  state: {
    chatSocket: null,
    messageSound: new Audio(process.env.VUE_APP_BASE_URL + "/media/sounds/message.mp3"),
  },
  getters: {
    chatSocket(state) {
      return state.chatSocket;
    },
  },
}