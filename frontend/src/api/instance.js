import axios from "axios";
import { getCookie, isAuthenticated } from "../utilities";

const baseURL = process.env.VUE_APP_BASE_URL + "/api";
const instance = axios.create({ baseURL });

instance.interceptors.request.use(async config => {
  if (await isAuthenticated()) {
    config.headers["Authorization"] = "Bearer " + getCookie("access");
  }

  return config;
});

export default instance;