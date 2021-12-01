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
