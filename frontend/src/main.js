import { createApp } from "vue";
import { VueReCaptcha } from "vue-recaptcha-v3";
import App from "./App.vue";
import TimeAgo from "javascript-time-ago";
import router from "./router";
import api from "./api/index";
import ru from "javascript-time-ago/locale/ru";
import store from "./store";
import "./assets/tailwind.css";
import { getCookie } from "./utilities";


const app = createApp(App);

app.config.globalProperties.baseURL = process.env["VUE_APP_BASE_URL"];
app.config.globalProperties.getCookie = getCookie;
app.provide("$api", api);

app.use(VueReCaptcha, { siteKey: process.env["VUE_APP_RECAPTCHA_PUBLIC"]});
app.config.globalProperties.recaptcha = async function(action) {
  await this.$recaptchaLoaded();
  return await this.$recaptcha(action);
}

TimeAgo.addDefaultLocale(ru);
app.config.globalProperties.timeAgo = new TimeAgo();

app.use(store);

app.use(router).mount("#app");