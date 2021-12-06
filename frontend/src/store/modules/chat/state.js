import { CHATS } from "../../../scripts/chat/constants";

export default {
  chats: null,
  chat: null,
  chatSocket: null,
  interlocutor: null,
  show: CHATS,
  globalChatSocket: null,
  messageSound: new Audio(process.env.VUE_APP_BASE_URL + "/media/sounds/message.mp3"),
}