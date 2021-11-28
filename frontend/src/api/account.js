import store from "../store/index";
import router from "../router";
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
    },
    async getViewedUser() {
      /* Получить информацию о просматриваемом пользователе */

      let url = "/api/account/";

      if (router.currentRoute["_value"].params.username) {
        url += router.currentRoute["_value"].params.username;
      }

      return await instance
        .get(url)
        .then(async response => {
          store.dispatch("loadUser").then();

          const user = response.data;

          document.title = `${user.username} - Профиль`;

          let extraText;
          let profileViewAccess;

          if (user.username === store.getters.user.username) {
            if (user["isPrivate"]) {
              extraText = "Ваш аккаунт приватный, другие пользователи (кроме друзей) не смогут увидеть информацию о Вас.";
            }
            profileViewAccess = true;
          } else if (user["isPrivate"]) {
            if (user["friendRequest"] === "accepted") {
              profileViewAccess = true;
            } else {
              extraText = "Приватный аккаунт. Информация скрыта.";
              profileViewAccess = false;
            }
          } else {
            profileViewAccess = true;
          }

          return { user, extraText, profileViewAccess };
        })
        .catch(error => {
          store.commit("updateStatus", error.response.status);
        });
    },
    async changePassword(action, body) {
      /* Изменить пароль */

      return await instance
        .patch(action, body)
        .then(async response => {
          document.cookie = "access=; Max-Age=0; path=/";
          document.cookie = "refresh=; Max-Age=0; path=/";

          await store.dispatch("loadUser");
          store.commit("createAlert", {
            title: "Вы успешно сменили пароль.",
            level: "success",
          });
          store.commit("updateOpenModal", false);
          await router.push('/');
        })
        .catch(error => {
          if (error.response.status === 400) {
            for (const field in error.response.data) {
              store.commit("createAlert",{
                title: parseErrors(error.response.data, field),
                level: "danger",
              });
            }
          } else {
            store.commit("updateStatus", error.response.status);
          }
        });
    },
    async deleteProfile(action, data) {
      /* Удалить профиль */

      return await instance
        .delete(action, { data })
        .then(response => {
          store.commit("createAlert", {
            title: "Вы успешно удалили профиль.",
            level: "success",
          });

          document.cookie = "access=; Max-Age=0; path=/";
          document.cookie = "refresh=; Max-Age=0; path=/";

          store.dispatch("loadUser");
          store.commit("updateOpenModal", false);
          router.push('/');
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
    async editProfile(action, body) {
      return await instance
        .patch(action, body, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then(response => {
          store.commit("createAlert",{
            title: "Вы успешно обновили профиль.",
            level: "success",
          });
          store.dispatch("loadUser");
          router.push("/account/");
        })
        .catch(error => {
          if (error.response.status === 400) {
            for (const field in error.response.data) {
              store.commit("createAlert",{
                title: parseErrors(error.response.data, field),
                level: "danger",
              });
            }
          } else {
            store.commit("updateStatus", error.response.status);
          }
        });
    },
    async search(body) {
      return await instance
        .post("/api" + window.location.pathname, body)
        .then(response => response.data)
        .catch(error => store.commit("updateStatus", error.response.status));
    },
    async getUsersList() {
      let url = "/api";

      if (["usersFriends", "usersViewers", "friends", "viewers"].includes(router.currentRoute.value)) {
        url += router.currentRoute.value;
      } else {
        url += "/account/users";
      }

      return await instance
        .get(url)
        .then(response => response.data)
        .catch(error => store.commit("updateStatus", error.response.status));
    },
    async sendFriendRequest(url) {
      return await instance
        .get(url)
        .then(response => {
          store.commit("createAlert", {
            title: response.data.title,
            level: "success",
          });
        })
        .catch(error => store.commit('updateStatus', error.response.status));
    },
    async googleAuth(code) {
      /* Авторизоваться через Google отправив code полученный из Google бэкенду */

      await instance
        .post("/api/account/social-authorization", {
          code,
          google_client_id: process.env["VUE_APP_GOOGLE_OAUTH2_PUBLIC"],
          provider: 'Google',
        })
        .then(response => {
          document.cookie = `access=${response.data.access}; path=/`;
          document.cookie = `refresh=${response.data.refresh}; path=/`;

          store.dispatch("loadUser");
          store.commit("createAlert", {
            title: "Вы успешно авторизовались.",
            level: "success",
          });
        })
        .catch(error => {
          if (error.response.status === 400) {
            store.commit("createAlert", {
              title: "Произошла ошибка. Попробуйте еще.",
              level: "danger",
            });
          } else if (error.response.status === 404) {
            store.commit("createAlert", {
              title: "Ваш аккаунт удален.",
              level: "danger",
            });
          } else {
            store.commit("updateStatus", error.response.status);
          }
        })
    }
  }
}