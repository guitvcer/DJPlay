import store from "../store/index";
import { getCookie, parseErrors } from "../utilities";

export default function(instance) {
  return {
    async getUser() {
      /* Получить пользователя или гостя */

      return instance
        .get("/api/account/")
        .then(response => response.data)
        .catch(error => {
          return store.getters.guest;
        });
    },
    async refreshToken() {
      /* Обновить access токен используя refresh токен */

      return instance
        .post("/api/account/refresh-token", {
          access: getCookie("access"),
          refresh: getCookie("refresh"),
        })
        .then(response => {
          document.cookie = `access=${response.data.access}; path=/`;
          return true;
        })
        .catch(error => false);
    },
    async auth(action, body) {
      /* Авторизовать */

      return await instance
        .post(action, body)
        .then(response => {
          store.commit("createAlert",{
            title: "Вы успешно вошли в аккаунт.",
            level: "success",
          });
          store.commit("updateOpenModal", false);

          document.cookie = `access=${response.data.access}; path=/`;
          document.cookie = `refresh=${response.data.refresh}; path=/`;

          store.dispatch("loadUser");
          // this.$emit("load-user");
        })
        .catch(error => {
          if (error.response.status === 400) {
            for (const field in error.response.data) {
              store.commit("createAlert", {
                title: parseErrors(error.response.data, field),
                level: "danger",
              });
            }
          } else {
            store.commit("updateStatus", error.response.status);
          }
        });
    },
    async register(action, body) {
      /* Зарегистрировать */

      return await instance
        .post(action, body)
        .then(response => {
          store.commit("createAlert", {
            title: "Вы успешно вошли в аккаунт",
            level: "success",
          });
          store.commit("updateOpenModal", false);

          document.cookie = `access=${response.data.access}; path=/`;
          document.cookie = `refresh=${response.data.refresh}; path=/`;

          store.dispatch("loadUser");
        })
        .catch(error => {
          if (error.response.status === 400) {
            for (const field in error.response.data) {
              store.commit("createAlert", {
                title: parseErrors(error.response.data, field),
                level: "danger",
              });
            }
          } else {
            store.commit("updateStatus", error.response.status);
          }
        });
    }
  }
}