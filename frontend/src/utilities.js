import axios from "axios";
import router from "./router";
import store from "./store/index";

export function getCookie(name) {
  /* Получить определенный куки */

  for (let i of document.cookie.split("; ")) {
    let j = i.split('=');

    if (j[0] === name) {
      return j[1];
    }
  }
}

export async function isAuthenticated() {
  /* Авторизован ли пользователя? */

  const access = getCookie("access");
  const refresh = getCookie("refresh");

  if (!access || !refresh) {
    return false;
  } else {
    return await axios
      .get(`${process.env.VUE_APP_BASE_URL}/api/account/`, {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      })
      .then(response => true)
      .catch(error => false)
  }
}

export function parseErrors(data, field) {
  /* Парсить api ошибки для создания уведомления */

  let alertTitle = ``;

  if (field !== "nonFieldErrors") {
    alertTitle = `<b>${field}:</b>`;
  }

  alertTitle += "<ul>";

  for (const fieldError of data[field]) {
    alertTitle += `<li>${fieldError}</li>`;
  }
  alertTitle += "</ul>";

  return alertTitle;
}

export function chatSocketOnOpen() {
  store.commit("chatSocketSend", {
    access: getCookie("access"),
  });
}

export function chatSocketOnMessage(e) {
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
  store.getters.messageSound.play();
}