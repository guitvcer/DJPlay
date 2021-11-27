export function getCookie(name) {
  /* Получить определенный куки */

  for (let i of document.cookie.split('; ')) {
    let j = i.split('=');
    if (j[0] === name) return j[1];
  }
}

export async function isAuthenticated() {
  /* Есть ли access и refresh токены в куки? */

  const refreshToken = getCookie('access')

  return !(refreshToken === undefined || refreshToken === '')
}

export function parseErrors(data, field) {
  /* Парсить api ошибки для создания уведомления */

  let alertTitle = ``

  if (field !== 'nonFieldErrors') alertTitle = `<b>${field}:</b>`

  alertTitle += `<ul>`

  for (const fieldError of data[field]) {
    alertTitle += `<li>${fieldError}</li>`
  }
  alertTitle += '</ul>'

  return alertTitle
}