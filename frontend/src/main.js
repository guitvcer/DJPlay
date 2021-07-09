import { createApp } from 'vue'
import App from './App.vue'
import './assets/tailwind.css'
import router from './router'

const app = createApp(App)
app.config.globalProperties.host = 'http://fdb7faec7d76.ngrok.io'

app.use(router).mount('#app')
