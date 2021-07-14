import { createApp } from 'vue'
import App from './App.vue'
import './assets/tailwind.css'
import router from './router'
import { getCookie, sendRequest, getUserInfo } from './utilities'

const app = createApp(App)
app.config.globalProperties.host = 'http://127.0.0.1:8000'
app.config.globalProperties.getCookie = getCookie
app.config.globalProperties.sendRequest = sendRequest
app.config.globalProperties.getUserInfo = getUserInfo

app.use(router).mount('#app')
