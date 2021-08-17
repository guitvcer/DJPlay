import axios from 'axios'

function getCookie(name) {
    for (let i of document.cookie.split('; ')) {
        let j = i.split('=');
        if (j[0] === name) return j[1];
    }
}

function isAuthenticated() {
    let accessToken = getCookie('access')

    return !(!accessToken || accessToken === '');
}

async function getUserInfo() {
    return axios
        .get(this.host + '/account/')
        .then(response => response.data)
        .catch(error => {
            return {
                username: 'Гость',
                avatar: '/media/user.png'
            }
        })
}

function parseErrors(data, field) {
    let alertTitle = ``

    if (field !== 'non_field_errors') alertTitle = `<b>${field}:</b>`

    alertTitle += `<ul>`

    for (const fieldError of data[field]) {
        alertTitle += `<li>${fieldError}</li>`
    }
    alertTitle += '</ul>'

    return alertTitle
}

export { getCookie, isAuthenticated, getUserInfo, parseErrors }