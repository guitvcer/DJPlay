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
  },
  state: {
    alerts: [],
    status: 200,
  },
  getters: {
    alerts(state) {
      return state.alerts;
    },
    status(state) {
      return state.status;
    },
  }
}