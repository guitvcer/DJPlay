import axios from "axios";
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

function squareBoard() {
  /* Сделать доску квадратной */

  const routeName = router.currentRoute.value.name;

  if (["chess", "gomoku", "gomokuParty"].includes(routeName)) {
    let boardID;
    if (["gomoku", "gomokuParty"].includes(routeName)) {
      boardID = "gomokuBoard";
    } else if (["chess", "chessParty"].includes(routeName)) {
      boardID = "chessBoard";
    }

    const board = document.getElementById(boardID);
    const main = document.getElementsByTagName("main")[0];
    let size;

    if (main.clientWidth > main.clientHeight) {
      size = main.clientHeight;
      size -= size / 5;
    } else {
      size = main.clientWidth;
      size -= size / 10;
    }

    board.style.height = size + "px";
    board.style.width = size + "px";
  }
}

export function onResizeBoard() {
  /* Сделать доску квадратным при изменении размера окна */

  squareBoard();
  window.addEventListener("resize", squareBoard);
}
