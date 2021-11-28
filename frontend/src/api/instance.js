import axios from "axios";
import { getCookie, isAuthenticated } from "../utilities";

const baseURL = process.env.VUE_APP_BASE_URL + "/api";
const instance = axios.create({ baseURL });

instance.interceptors.request.use(async config => {
  let isAuthorized;

  await isAuthenticated().then(value => isAuthorized = value);

  if (isAuthorized) {
    await fetch(`${baseURL}/account/`, {
      headers: {
        Authorization: "Bearer " + getCookie("access"),
      }
    })
      .then(response => {
        isAuthorized = response.status !== 401;
      })
  }

  if (isAuthorized) {
    config.headers["Authorization"] = "Bearer " + getCookie("access");
  }

  return config;
})

export default instance;