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
            let alertsList = {
                alerts: [],
                type: 'alert',
                status: response.status
            }

            for (let field in error) {
                let title

                if (field === 'non_field_errors' || field === 'title') {
                    title = error[field]
                } else {
                    title = `
                    <strong>${field}:</strong>&nbsp;
                    <ul>
                `
                    for (let description of error[field]) {
                        title += `
                        <li>${description}</li>
                    `
                    }
                    title += `</ul>`
                }

                alertsList.alerts.push({
                    level: 'danger',
                    title: title
                })
            }

            return alertsList
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