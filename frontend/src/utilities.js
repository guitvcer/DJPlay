import axios from 'axios'
import host from './main.js'

function getCookie(name) {
    for (let i of document.cookie.split('; ')) {
        let j = i.split('=');
        if (j[0] === name) return j[1];
    }
}

async function refreshToken() {
    return axios
        .post(`${host}/api/account/refresh-token`, {
            access: getCookie('access'),
            refresh: getCookie('refresh')
        })
        .then(response => {
            document.cookie = `access=${response.data.access}; path=/`
            return true
        })
        .catch(error => false)
}

async function isAuthenticated() {
    const refreshToken = getCookie('access')

    return !(refreshToken === undefined || refreshToken === '')
}

async function getUserInfo() {
    return axios
        .get(`${host}/api/account/`)
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

    if (field !== 'nonFieldErrors') alertTitle = `<b>${field}:</b>`

    alertTitle += `<ul>`

    for (const fieldError of data[field]) {
        alertTitle += `<li>${fieldError}</li>`
    }
    alertTitle += '</ul>'

    return alertTitle
}

export { getCookie, isAuthenticated, getUserInfo, parseErrors, refreshToken }