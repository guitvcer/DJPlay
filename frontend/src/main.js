import { createApp } from 'vue'
import App from './App.vue'
import './assets/tailwind.css'
import router from './router'

const app = createApp(App)
app.config.globalProperties.host = 'http://127.0.0.1:8000'

app.use(router).mount('#app')
