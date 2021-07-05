import { createApp } from 'vue'
import App from './App.vue'
import './assets/tailwind.css'
import router from './router'

const app = createApp(App)
app.config.globalProperties.host = 'https://djplay.space'

app.use(router).mount('#app')
