import { createApp } from 'vue'
import App from './App.vue'
import './assets/tailwind.css'
import router from './router'
import { getCookie, isAuthenticated, getUserInfo, parseErrors, refreshToken } from './utilities'
import axios from 'axios'
import { VueReCaptcha } from 'vue-recaptcha-v3'
import TimeAgo from 'javascript-time-ago'
import ru from 'javascript-time-ago/locale/ru'


const app = createApp(App)
const domain = '127.0.0.1:8000'

app.config.globalProperties.host = 'http://' + domain
app.config.globalProperties.webSocketHost = 'ws://' + domain
app.config.globalProperties.getCookie = getCookie
app.config.globalProperties.isAuthenticated = isAuthenticated
app.config.globalProperties.getUserInfo = getUserInfo
app.config.globalProperties.parseErrors = parseErrors
app.config.globalProperties.refreshToken = refreshToken

axios.interceptors.request.use(async config => {
    let isAuthorized

    await isAuthenticated().then(value => isAuthorized = value)

    if (isAuthorized) {
        await fetch(`${app.config.globalProperties.host}/account/`, {
            headers: {
                Authorization: `Bearer ${getCookie('access')}`
            }
        })
            .then(response => {
                if (response.status === 401) isAuthorized = false
                else isAuthorized = true
            })
    }
    if (isAuthorized) {
        config.headers['Authorization'] = `Bearer ${getCookie('access')}`
    }
    return config
})

app.use(VueReCaptcha, { siteKey: process.env["VUE_APP_RECAPTCHA_PUBLIC"] })
app.config.globalProperties.recaptcha = async function(action) {
    await this.$recaptchaLoaded()
    return await this.$recaptcha(action)
}

TimeAgo.addDefaultLocale(ru)
app.config.globalProperties.timeAgo = new TimeAgo()

app.config.globalProperties.GOOGLE_CLIENT_ID = process.env["VUE_APP_GOOGLE_OAUTH2_PUBLIC"]
app.config.globalProperties.VK_CLIENT_ID = process.env["VUE_APP_VK_OAUTH2_PUBLIC"]

app.use(router).mount('#app')

export default app.config.globalProperties.host