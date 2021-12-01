import axios from "axios";
import store from "./store/index";
import router from "./router";

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
  /* Спарсить api ошибки для создания уведомления */

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