import { DateTime } from "luxon";
import TimeAgo from "javascript-time-ago";
import router from "../../router";
import store from "../../store/index";

export function getInterlocutor(chat) {
  return (chat["user1"].username === store.getters.user.username) ? chat["user2"] : chat["user1"];
}

export function scrollToEnd() {
  setTimeout(() => {
    const messagesEl = document.getElementById("messages");
    messagesEl.scrollTo(0, messagesEl.scrollHeight);
  }, 5);
}

export function setEventForEscape() {
  document.addEventListener("keyup", event => {
    event.preventDefault();

    if (event.keyCode === 27) {
      store.dispatch("unselectChat")();
    }
  });
}

export function lastOnline() {
  if (store.getters.interlocutor["gender"] === 'M') {
    return "Был в сети "
  } else if (store.getters.interlocutor["gender"] === 'F') {
    return "Была в сети ";
  } else {
    return "Был(-а) в сети ";
  }
}

export function parseDate(date) {
  if (date == null) {
    return "никогда";
  }

  return new TimeAgo().format(Date.parse(date));
}

export function parseMessageDate(date) {
  const messageDate = DateTime.fromISO(date);

  if (messageDate.year === DateTime.now().year) {
    return messageDate.setLocale("ru").toFormat("d MMMM");
  } else {
    return messageDate.setLocale("ru").toFormat("d MMMM y") + " г.";
  }
}

export function parseMessageTime(date) {
  return DateTime.fromISO(date).setLocale("ru").toFormat("H:m");
}

export function otherDay(index, date) {
  if (index === 0) {
    return true;
  }

  const messageDate = DateTime.fromISO(date);
  const nextMessageDate = DateTime.fromISO(store.getters.chat.messages[index - 1].date);

  return (messageDate.day !== nextMessageDate.day) ||
    (messageDate.month !== nextMessageDate.month) ||
    (messageDate.year !== nextMessageDate.year);
}

export function lastMessage(chat) {
  if (chat["lastMessage"]["text"] !== "") {
    if (chat["lastMessage"]['sentFrom']['username'] === router.currentRoute.value.params.username) {
      return chat["lastMessage"]["text"];
    } else {
      return `Вы: ${chat["lastMessage"]["text"]}`;
    }
  }
}
