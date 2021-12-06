import { getCookie, isAuthenticated } from "../../../utilities";
import api from "../../../api";
import router from "../../../router";

export default {
  clearSimilarAlerts({ commit, getters }, url) {
    let deletedAlertsCount = 0;
    const alertsLength = getters.alerts.length;

    for (let index = 0; index < alertsLength; index++) {
      if (getters.alerts[index - deletedAlertsCount].url === url) {
        commit("removeAlert", index - deletedAlertsCount);
        deletedAlertsCount++;
      }
    }
  },
  async loadUser({ dispatch, commit, getters }, createAlert = false) {
    if (await isAuthenticated()) {
      const user = await api.account.getUser();

      commit("updateUser", user);
      commit("updateUserLoading", false);
      dispatch("openGlobalChatSocket");
    } else {
      if (!getCookie("access") || !getCookie("refresh")) {
        commit("closeGlobalChatSocket");
        commit("updateUser", getters.guest);
        commit("updateUserLoading", false);
      } else {
        if (await api.account.refreshToken()) {
          const user = await api.account.getUser();

          commit("updateUserLoading", false);
          commit("updateUser", user);
          dispatch("openGlobalChatSocket");
        } else {
          if (createAlert) {
            commit("createAlert", {
              title: "Данные авторизации устарели. Войдите в аккаунт заново.",
              level: "warning",
            });
          }

          dispatch("closeGlobalChatSocket");
          commit("updateUser", getters.guest);
          commit("updateUserLoading", false);
          commit("closeGlobalChatSocket");
        }
      }
    }
  },
  async logout({ dispatch, commit }) {
    document.cookie = "access=; Max-Age=0; path=/";
    document.cookie = "refresh=; Max-Age=0; path=/";

    await dispatch("loadUser");
    commit("createAlert", {
      title: "Вы успешно вышли из аккаунта.",
      level: "success"
    });
    commit("closeGlobalChatSocket");
    router.push("/").then();
  },
}