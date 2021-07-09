import { createApp } from 'vue'
import App from './App.vue'
import './assets/tailwind.css'
import router from './router'

function getCookie(name) {
    for (let i of document.cookie.split('; ')) {
        let j = i.split('=');
        if (j[0] === name) return j[1];
    }
}

const app = createApp(App)
app.config.globalProperties.host = 'http://127.0.0.1:8000'
app.config.globalProperties.getCookie = getCookie

app.use(router).mount('#app')
