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

function sendRequest(url, method='GET', body=null) {
    let accessToken = getCookie('access'),
        headers = {
            'Content-Type': 'application/json'
        }

    if (accessToken !== '' && accessToken) {
        headers['Authorization'] = 'Bearer ' + accessToken
    }
    return fetch(url, {
        method: method,
        body: body,
        headers: headers
    }).then(response => {
        if (response.ok) return response.json()

        return response.text().then(error => {
            let alert = {
                level: 'danger',
                type: 'alert',
                status: response.status
            }

            if (response.status === 400) {
                try {
                    alert.title = JSON.parse(error).non_field_errors[0]
                } catch (e) {
                    alert.title = JSON.parse(error)
                }
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