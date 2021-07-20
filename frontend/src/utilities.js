function getCookie(name) {
    for (let i of document.cookie.split('; ')) {
        let j = i.split('=');
        if (j[0] === name) return j[1];
    }
}

function isAuthenticated() {
    let accessToken = getCookie('access')

    if (!accessToken || accessToken === '') return false

    return true
}

function sendRequest(url, method='GET', body=null, file = false) {
    const accessToken = getCookie('access')
    let headers = {}

    if (!file) headers['Content-Type'] = 'application/json'

    if (accessToken !== '' && accessToken) {
        headers['Authorization'] = 'Bearer ' + accessToken
    }
    return fetch(url, {
        method: method,
        body: body,
        headers: headers
    }).then(response => {
        if (response.ok) return response.json()

        return response.json().then(error => {
            let alert = {
                level: 'danger',
                type: 'alert',
                status: response.status
            }

            if (response.status === 400) {
                let alertsList = {
                    alerts: [],
                    type: 'alert'
                }

                for (let field in error) {
                    let title = `
                        <strong>${field}:</strong>&nbsp;
                        <ul>
                    `
                    for (let description of error[field]) {
                        title += `
                            <li>${description}</li>
                        `
                    }
                    title += `</ul>`

                    alertsList.alerts.push({
                        level: 'danger',
                        title: title
                    })
                }

                return alertsList
            } else if (response.status === 401) {
                alert.title = 'Вы не авторизованы.'
            } else if (response.status === 403) {
                alert.title = 'Данная страница недоступна.'
            } else if (response.status === 404) {
                alert.title = 'Запрашиваемая страница не найдена.'
            } else if (response.status === 405) {
                alert.title = 'Данный метод запроса недоступна.'
            } else if (response.status === 500) {
                alert.title = 'Внутренняя ошибка сервера.'
            }

            return alert
        })
    })
}

function getUserInfo() {
    let accessToken = getCookie('access')

    if (accessToken) {
        return sendRequest(this.host + '/account/')
    } else {
        return {
            username: 'Гость',
            avatar: '/media/user.png'
        }
    }
}

export { getCookie, isAuthenticated, sendRequest, getUserInfo }