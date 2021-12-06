import { ref } from "vue";

export default {
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
}