import TimeAgo from "javascript-time-ago";
import { DateTime } from "luxon";

export function getFieldValue(field) {
  if (field.fieldValue === null) return "Не указано";

  if (typeof field.fieldValue === "string") {
    if (field.fieldValue === "") {
      return "Не указано";
    } else if (["Был(-а) онлайн", "Был онлайн", "Была онлайн"].includes(field.fieldName)) {
      return new TimeAgo().format(Date.parse(field.fieldValue));
    } else if (field.fieldName === "Дата рождения" || field.fieldName === "Дата регистрации") {
      const date = DateTime.fromISO(field.fieldValue).setLocale("ru").toFormat("d MMMM y") + " г.";

      if (field.fieldName === "Дата регистрации") {
        return date + ' ' + DateTime.fromISO(field.fieldValue).setLocale("ru").toFormat("H:m");
      } else {
        return date;
      }
    } else {
      field.fieldValue.substr(0, 48);
    }
  }

  return field.fieldValue;
}

export function parseDate(date) {
  return DateTime.fromISO(date).setLocale("ru").toFormat("d MMMM y H:m");
}

export function getPartyResult(party, game, user) {
  if (game === "gomoku") {
    if (party["winner"] === null) {
      return "Н/Д";
    } else if (party["winner"].id === user.id) {
      return "Выигрыш";
    } else {
      return "Проигрыш";
    }
  } else if (game === "chess") {
    if (party["result"] === null) {
      return "Н/Д";
    } else if (party["result"] === "draw") {
      return "Ничья";
    } else if (party[party["result"]] === user.id) {
      return "Выигрыш.";
    } else {
      return "Проигрыш.";
    }
  }
}

export function getPartyPlayers(party, game) {
  if (game === "gomoku") {
    return `${party["player1"].username}, ${party["player2"].username}`;
  } else if (game === "chess") {
    return `${party["white"].username}, ${party["white"].username}`;
  }
}