import { ref } from "vue";

export default {
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
  },
}