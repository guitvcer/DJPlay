import router from "../../router";
import api from "../../api/index";
import { isAuthenticated } from "../../utilities";
import {
  chatSocketOnOpen,
  chatSocketOnMessage,
  globalChatSocketOnMessage,
  globalChatSocketOnOpen,
} from "../../scripts/chat/socket";
import { getInterlocutor, scrollToEnd } from "../../scripts/chat/index";
import { CHATS } from "../../scripts/chat/constants";

export default {
  actions: {
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
  },
  mutations: {
    updateChats(state, chats) {
      state.chats = chats;
    },
    updateChat(state, chat) {
      state.chat = chat;
    },

    updateInterlocutor(state, interlocutor = null) {
      state.interlocutor = interlocutor;
    },

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
    closeChatSocket(state) {
      try {
        state.chatSocket.close();
      } catch (e) {}
    },

    updateGlobalChatSocket(state, socket) {
      state.globalChatSocket = socket;
    },
    updateGlobalChatSocketOnOpen(state, func) {
      state.globalChatSocket.onopen = func;
    },
    updateGlobalChatSocketOnMessage(state, func) {
      state.globalChatSocket.onmessage = func;
    },
    globalChatSocketSend(state, object) {
      state.globalChatSocket.send(JSON.stringify(object));
    },
    closeGlobalChatSocket(state) {
      try {
        state.globalChatSocket.close();
      } catch (e) {}
    },

    updateMessageSoundTime(state, seconds) {
      state.messageSound.currentTime = seconds;
    },

    addMessage(state, message) {
      state.chat.messages.push(message);
      scrollToEnd();
    },

    updateShow(state, show) {
      state.show = show;
    },
  },
  state: {
    chats: null,
    chat: null,
    chatSocket: null,
    interlocutor: null,
    show: CHATS,
    globalChatSocket: null,
    messageSound: new Audio(process.env.VUE_APP_BASE_URL + "/media/sounds/message.mp3"),
  },
  getters: {
    chats(state) {
      return state.chats;
    },
    chat(state) {
      return state.chat;
    },
    chatSocket(state) {
      return state.chatSocket;
    },
    globalChatSocket(state) {
      return state.globalChatSocket;
    },
    messageSound(state) {
      return state.messageSound;
    },
    interlocutor(state) {
      return state.interlocutor;
    },
    show(state) {
      return state.show;
    },
  },
}