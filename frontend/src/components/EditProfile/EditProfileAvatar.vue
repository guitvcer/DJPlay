<template>
  <div class="mx-2 lg:mx-12 mb-12 flex-shrink-0 flex flex-col justify-center">
    <avatar-input
      class="w-56 h-56 rounded mb-6 mx-auto"
      :default-src="host + '/media/avatars/user.png'"
      :avatar="host + user.avatar"
    />
    <h2
      class="text-3xl font-semibold mb-3 text-center lg:text-left select-text"
      style="word-break: break-word"
    >{{ user.username }}</h2>

    <hr>

    <div class="flex justify-center mt-3">
      <profile-button
        buttonName="userProfileEditSave"
        title="Сохранить"
        type="submit"
      />
      <profile-button
        buttonName="userProfileEditCancel"
        title="Отменить"
        :url="{ name: 'profile', params: { username: $props.user.username } }"
      />
      <profile-button
        buttonName="userProfileEditChangePassword"
        title="Сменить пароль"
        type="button"
        @click="updateModalAction('changePassword'); updateOpenModal(true);"
      />
      <profile-button
        buttonName="userProfileEditDelete"
        title="Удалить аккаунт"
        type="button"
        @click="updateModalAction('deleteProfile'); updateOpenModal(true);"
      />
    </div>
  </div>
</template>

<script>
import { mapMutations } from "vuex";
import AvatarInput from "./AvatarInput.vue";
import ProfileButton from "../Profile/ProfileButton.vue";

export default {
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      avatar: null,
    }
  },
  components: { AvatarInput, ProfileButton },
  methods: mapMutations(["updateModalAction", "updateOpenModal"]),
}
</script>