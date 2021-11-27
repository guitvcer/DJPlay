<template>
  <form :action="this.action" method="post" @submit.prevent="submitForm">
    <div class="px-4 pt-12">
      <h3 class="text-center text-4xl font-semibold">Вход в аккаунт</h3>
      <div class="flex flex-col mt-12">
        <input
          v-for="input in inputs"
          :type="input.type"
          :name="input.name"
          :id="input.id"
          :placeholder="input.placeholder"
          class="border border-main my-1 rounded px-2 py-2 dark:bg-main"
          v-model="body[input.name]"
          required
        >
      </div>
      <social-auth-links />
      <div class="text-sm pb-4">
        Этот сайт защищен Google reCAPTCHA<br>
        <a
          href="https://policies.google.com/privacy"
          class="text-blue-500 hover:underline cursor-pointer"
        >Политика конфиденциальности</a> и
        <a
          href="https://policies.google.com/terms"
          class="text-blue-500 hover:underline cursor-pointer"
        >Условия использования.</a>
      </div>
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
        @click="$emit('close-modal')"
      >Отмена</button>
    </div>
  </form>
</template>

<script>
import { mapMutations } from "vuex";
import axios from "axios";
import SocialAuthLinks from "./SocialAuthLinks";

export default {
  components: {SocialAuthLinks},
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
      action: this.host + "/api/account/authorization",
      origin: window.location.origin,
    }
  },
  methods: {
    ...mapMutations(["createAlert"]),
    async submitForm() {
      this.body.recaptcha = await this.recaptcha("authorization");

      await axios
        .post(this.action, this.body)
        .then(response => {
          this.createAlert({
            title: "Вы успешно вошли в аккаунт.",
            level: "success",
          });
          this.$emit("close-modal");

          document.cookie = `access=${response.data.access}; path=/`;
          document.cookie = `refresh=${response.data.refresh}; path=/`;

          this.$emit("load-user");
        })
        .catch(error => {
          if (error.response.status === 400) {
            for (const field in error.response.data) {
              this.createAlert({
                title: this.parseErrors(error.response.data, field),
                level: "danger",
              });
            }
          } else {
            this.$emit("api-error", error);
          }
        });

      this.body.username = '';
      this.body.password = '';
      this.body.recaptcha = '';
    },
  },
}
</script>