import { ref } from "vue";
import router from "../../router";
import api from "../../api/index";
import { isAuthenticated, refreshToken } from "../../utilities";

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
    async loadUser({ dispatch, commit, getters }) {
      if (await isAuthenticated()) {
        const user = await api.account.getUser();

        if (user.username === getters.guest.username) {
          if (await refreshToken()) {
            commit("createAlert", {
              title: "Данные авторизации были обновлены.",
              level: "simple",
            });

            await dispatch("loadUser");
          } else {
            commit("createAlert", {
              title: "Данные авторизации устарели. Войдите в аккаунт заново.",
              level: "warning",
            });

            commit("updateUser", user);
          }
        } else {
          commit("updateUser", user);
        }
      } else {
        commit("updateUser", getters.guest);
      }

      commit("updateUserLoading", false);
    },
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
      console.log(state.user);
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