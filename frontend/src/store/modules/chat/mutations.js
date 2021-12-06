import { scrollToEnd } from "../../../scripts/chat";

export default {
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
}