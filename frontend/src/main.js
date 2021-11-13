import { createApp } from 'vue'
import { VueReCaptcha } from 'vue-recaptcha-v3'
import App from './App.vue'
import TimeAgo from 'javascript-time-ago'
import axios from 'axios'
import router from './router'
import api from './api/index'
import ru from 'javascript-time-ago/locale/ru'
import store from './store'
import './assets/tailwind.css'
import { getCookie, isAuthenticated, getUserInfo, parseErrors, refreshToken } from './utilities'


const app = createApp(App)
const domain = process.env["VUE_APP_BACKEND_HOST"] ?? '192.168.1.2:8000'
const httpProtocol = process.env["VUE_APP_HTTP_PROTOCOL"] ?? 'http'
const webSocketProtocol = process.env["VUE_APP_WEBSOCKET_PROTOCOL"] ?? 'ws'

app.config.globalProperties.host = `${httpProtocol}://${domain}`
app.config.globalProperties.webSocketHost = `${webSocketProtocol}://${domain}/api`
app.config.globalProperties.getCookie = getCookie
app.config.globalProperties.isAuthenticated = isAuthenticated
app.config.globalProperties.getUserInfo = getUserInfo
app.config.globalProperties.parseErrors = parseErrors
app.config.globalProperties.refreshToken = refreshToken
app.provide('$api', api)

axios.interceptors.request.use(async config => {
    let isAuthorized

    await isAuthenticated().then(value => isAuthorized = value)

    if (isAuthorized) {
        await fetch(`${app.config.globalProperties.host}/api/account/`, {
            headers: {
                Authorization: `Bearer ${getCookie('access')}`
            }
        })
            .then(response => {
                isAuthorized = response.status !== 401;
            })
    }
    if (isAuthorized) {
        config.headers['Authorization'] = `Bearer ${getCookie('access')}`
    }
    return config
})

app.use(VueReCaptcha, { siteKey: process.env["VUE_APP_RECAPTCHA_PUBLIC"] ?? "6LdAUyUcAAAAANujUGnroaWZd6C5woLmMVpQdRtD" })
app.config.globalProperties.recaptcha = async function(action) {
    await this.$recaptchaLoaded()
    return await this.$recaptcha(action)
}

TimeAgo.addDefaultLocale(ru)
app.config.globalProperties.timeAgo = new TimeAgo()

app.config.globalProperties.GOOGLE_CLIENT_ID = process.env["VUE_APP_GOOGLE_OAUTH2_PUBLIC"] ?? "568731334008-liiq5eghbc2icnc51c4mrfcdcldsstvn.apps.googleusercontent.com"
app.config.globalProperties.VK_CLIENT_ID = process.env["VUE_APP_VK_OAUTH2_PUBLIC"] ?? "7938245"

app.use(store)

app.use(router).mount('#app')

export default app.config.globalProperties.host