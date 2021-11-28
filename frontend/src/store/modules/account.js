import { ref } from "vue";
import router from "../../router";
import api from "../../api/index";
import { isAuthenticated, getCookie } from "../../utilities";

export default {
  actions: {
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
    async loadUser({ commit, getters }, createAlert = false) {
      if (await isAuthenticated()) {
        const user = await api.account.getUser();

        commit("updateUser", user);
        commit("updateUserLoading", false);
      } else {
        if (!getCookie("access") || !getCookie("refresh")) {
          commit("updateUser", getters.guest);
          commit("updateUserLoading", false);
        } else {
          if (await api.account.refreshToken()) {
            const user = await api.account.getUser();

            commit("updateUserLoading", false);
            commit("updateUser", user);
          } else {
            if (createAlert) {
              commit("createAlert", {
                title: "Данные авторизации устарели. Войдите в аккаунт заново.",
                level: "warning",
              });
            }

            commit("updateUser", getters.guest);
            commit("updateUserLoading", false);
          }
        }
      }
    },
    async logout({ dispatch, commit }) {
      // this.$parent.$parent.chatSocket.close();

      document.cookie = "access=; Max-Age=0; path=/";
      document.cookie = "refresh=; Max-Age=0; path=/";

      await dispatch("loadUser");
      commit("createAlert",{
        title: "Вы успешно вышли из аккаунта.",
        level: "success"
      });
      router.push("/").then();
    }
  },
  mutations: {
    createAlert(state, alert) {
      state.alerts.push(alert);
    },
    removeAlert(state, index) {
      state.alerts.splice(index, 1);
    },
    clearAlerts(state) {
      state.alerts = [];
    },

    updateStatus(state, status) {
      state.status = status;
    },

    updateOpenModal(state, value) {
      state.openModal = ref(value);
    },
    updateModalAction(state, value) {
      state.modalAction = value;
    },

    updateUser(state, user) {
      state.user = user;
    },
    updateUserLoading(state, value) {
      state.userLoading = value;
    }
  },
  state: {
    alerts: [],
    status: 200,
    openModal: ref(false),
    modalAction: null,
    user: null,
    guest: {
      username: "Гость",
      avatar: "/media/avatars/user.png",
    },
    userLoading: true,
  },
  getters: {
    alerts(state) {
      return state.alerts;
    },
    status(state) {
      return state.status;
    },
    openModal(state) {
      return state.openModal;
    },
    modalAction(state) {
      return state.modalAction;
    },
    user(state) {
      return state.user;
    },
    guest(state) {
      return state.guest;
    },
    userLoading(state) {
      return state.userLoading;
    }
  }
}