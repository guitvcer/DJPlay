import router from "../../router";
import store from "../../store";
import { getCookie } from "../../utilities";

export function chatSocketOnOpen() {
  store.commit("chatSocketSend", {
    access: getCookie("access"),
    chatId: store.getters.chat.id,
  });
}

export function chatSocketOnMessage(e) {
  const data = JSON.parse(e.data);

  if (data.status === 400 || !store.getters.chat) {
    return;
  }

  const newMessage = data.message;

  for (const message of store.getters.chat.messages) {
    if (message.id === newMessage.id) {
      return;
    }
  }

  store.commit("addMessage", newMessage);
  store.dispatch("loadChats").then();
}

export function globalChatSocketOnMessage(e) {
  const data = JSON.parse(e.data);

  if (data.status === 400) return;

  const message = data.message;

  if (router.currentRoute.value.params.username === message["sentFrom"]["username"]) return;

  const title = `
  <div class="flex hover:bg-gray-100 p-2 rounded w-full">
    <div>
      <div
        style="
          background-image: url(${process.env.VUE_APP_BASE_URL}${message["sentFrom"]["avatar"]}); 
          background-size: 100% 100%
        "
        class="w-12 h-12 rounded flex justify-end items-end"
      >
        <div class="rounded w-4 h-4 bg-green-500"></div>
      </div>
    </div>
    <div class="ml-3">
      <h2 class="text-xl font-semibold">${message["sentFrom"]["username"]}</h2>
      <p class="text-gray-500 break-all">${message["text"]}</p>
    </div>
  </div>`;

  store.commit("createAlert", {
    level: "simple",
    url: `/chat/${message["sentFrom"]["username"]}/`,
    title: title,
  });
  store.commit("updateMessageSoundTime", 0);
  store.getters.messageSound.play().then();
}

export function globalChatSocketOnOpen() {
  store.commit("globalChatSocketSend", {
    access: getCookie("access"),
  });
}