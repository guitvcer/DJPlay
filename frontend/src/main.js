import { createApp } from 'vue'
import App from './App.vue'
import './assets/tailwind.css'
import router from './router'
import { getCookie, isAuthenticated, getUserInfo, parseErrors } from './utilities'
import axios from 'axios'

axios.interceptors.request.use(config => {
    if (isAuthenticated()) {
        config.headers['Authorization'] = `Bearer ${getCookie('access')}`
    }
    return config
})

const app = createApp(App)
const domain = '127.0.0.1:8000'

app.config.globalProperties.host = 'http://' + domain
app.config.globalProperties.webSocketHost = 'ws://' + domain
app.config.globalProperties.getCookie = getCookie
app.config.globalProperties.isAuthenticated = isAuthenticated
app.config.globalProperties.getUserInfo = getUserInfo
app.config.globalProperties.parseErrors = parseErrors
app.config.globalProperties.dotClassName = 'dot rounded-full pointer text-center text-xs sm:text-base flex items-center justify-center'

app.use(router).mount('#app')