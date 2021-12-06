import api from "../../../api";
import router from "../../../router";
import { getInterlocutor } from "../../../scripts/chat";
import { isAuthenticated } from "../../../utilities";
import {
  chatSocketOnMessage,
  chatSocketOnOpen,
  globalChatSocketOnMessage,
  globalChatSocketOnOpen
} from "../../../scripts/chat/socket";
import { CHATS } from "../../../scripts/chat/constants";

export default {
  async loadChats({ commit }) {
    commit("updateChats", await api.chat.getChats());
  },
  async loadChat({ dispatch, commit, getters }, username) {
    dispatch("unselectChat");
    commit("updateChat", await api.chat.getChat(username));
    dispatch("updateInterlocutor");

    document.title = `Сообщения - ${getters.interlocutor.username}`;

    dispatch("openChatSocket");
    await router.push("/chat/" + getters.interlocutor.username + "/");
  },
  updateInterlocutor({ commit, getters }) {
    commit("updateInterlocutor", getInterlocutor(getters.chat))
  },
  async openChatSocket({ commit }) {
    if (await isAuthenticated()) {
      commit("updateChatSocket", new WebSocket(process.env.VUE_APP_BASE_WS_URL + "/ws"));
      commit("updateChatSocketOnOpen", chatSocketOnOpen);
      commit("updateChatSocketOnMessage", chatSocketOnMessage);
    }
  },
  async openGlobalChatSocket({ commit }) {
    if (await isAuthenticated()) {
      commit("updateGlobalChatSocket", new WebSocket(process.env.VUE_APP_BASE_WS_URL + "/ws"));
      commit("updateGlobalChatSocketOnOpen", globalChatSocketOnOpen);
      commit("updateGlobalChatSocketOnMessage", globalChatSocketOnMessage);
    }
  },
  unselectChat({ commit }) {
    commit("updateChat", null);
    commit("updateShow", CHATS);
    commit("closeChatSocket");
    router.push("/chat/").then();
  },
  submitMessage({ commit, getters }, text) {
    const messageText = text.trim();

    if (messageText === "") {
      commit("createAlert", {
        title: "Нельзя отправлять пустые сообщения.",
        level: "danger",
      }, { root: true });

      return;
    }

    commit("chatSocketSend", {
      messageText: messageText,
      chatId: getters.chat.id,
    });
  }
}