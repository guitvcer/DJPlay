<template>
  <form :action="this.host + this.action" method="post" @submit.prevent="submitForm">
    <div class="px-4 pt-12">
      <h3 class="text-center text-4xl font-semibold">Вход в аккаунт</h3>
      <div class="flex flex-col mt-12">
        <input
          v-for="input in inputs"
          :type="input.type"
          :name="input.name"
          :id="input.id"
          :placeholder="input.placeholder"
          v-model="body[input.name]"
          class="border border-main my-1 rounded px-2 py-2 dark:bg-main"
          required
        >
      </div>

      <social-auth-links />
      <recaptcha-links />
    </div>
    <div class="bg-gray-50 dark:bg-main-dark py-3 px-6 flex flex-row-reverse">
      <button
        type="submit"
        class="
          inline-flex justify-center rounded-md border font-semibold border-transparent shadow-sm cursor-pointer
          px-4 py-2 bg-main text-base text-white hover:bg-main-dark ml-3 w-auto text-sm dark:bg-gray-100
          dark:text-black dark:hover:bg-gray-300
        "
      >Войти</button>
      <button
        type="button"
        class="
          inline-flex justify-center rounded-md border font-semibold border-main shadow-sm cursor-pointer px-4
          py-2 bg-white text-base text-gray-700 hover:bg-gray-50 mt-0 ml-3 w-auto text-sm dark:bg-red-500
          dark:text-gray-50 dark:hover:bg-red-600
        "
        ref="cancelButtonRef"
        @click="updateOpenModal(false)"
      >Отмена</button>
    </div>
  </form>
</template>

<script>
import { mapMutations } from "vuex";
import api from "../../api/index";
import SocialAuthLinks from "./SocialAuthLinks";
import RecaptchaLinks from "./RecaptchaLinks";

export default {
  components: { RecaptchaLinks, SocialAuthLinks },
  data() {
    return {
      body: {
        username: '',
        password: '',
        recaptcha: '',
      },
      inputs: [
        {
          type: "text",
          name: "username",
          id: "username",
          placeholder: "Имя пользователя",
        },
        {
          type: "password",
          name: "password",
          id: "password",
          placeholder: "Пароль",
        }
      ],
      action: "/api/account/authorization",
    }
  },
  methods: {
    ...mapMutations(["createAlert", "updateOpenModal"]),
    async submitForm() {
      this.body.recaptcha = await this.recaptcha("authorization");

      await api.account.auth(this.action, this.body);

      this.body.username = '';
      this.body.password = '';
      this.body.recaptcha = '';
    },
  },
}
</script>