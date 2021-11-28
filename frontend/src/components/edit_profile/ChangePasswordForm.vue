<template>
  <form :action="this.baseURL + '/api' + action" @submit.prevent="submitForm">
    <div class="px-4 py-12">
      <h3 class="text-center text-4xl font-semibold">Сменить пароль</h3>
      <div class="flex flex-col mt-12">
        <input
          v-for="(input, index) in inputs"
          :key="index"
          type="password"
          :name="input.name"
          :id="input.name"
          :placeholder="input.placeholder"
          v-model="body[input.name]"
          class="border border-main my-1 rounded px-2 py-2 dark:bg-main"
          required
        >
      </div>
    </div>

    <div class="bg-gray-50 dark:bg-main-dark py-3 px-6 flex flex-row-reverse">
      <button
        type="submit"
        class="
          inline-flex justify-center rounded-md border font-semibold border-transparent shadow-sm cursor-pointer
          px-4 py-2 bg-main text-base text-white hover:bg-main-dark ml-3 w-auto text-sm dark:bg-gray-100 dark:text-black
          dark:hover:bg-gray-300
        "
      >Сменить</button>
      <button
        type="button"
        class="
          inline-flex justify-center rounded-md border font-semibold border-main shadow-sm cursor-pointer px-4 py-2
          bg-white text-base text-gray-700 hover:bg-gray-50 mt-0 ml-3 w-auto text-sm dark:bg-red-500 dark:text-gray-50
          dark:hover:bg-red-600
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

export default {
  data() {
    return {
      action: "/account/change-password",
      body: {
        oldPassword: '',
        password1: '',
        password2: '',
      },
      inputs: [
        {
          placeholder: "Старый пароль",
          name: "oldPassword",
        },
        {
          placeholder: "Новый пароль",
          name: "password1",
        },
        {
          placeholder: "Новый пароль (повторно)",
          name: "password2",
        },
      ],
    }
  },
  methods: {
    ...mapMutations(["createAlert", "updateOpenModal"]),
    async submitForm() {
      await api.account.changePassword(this.action, this.body);
      this.body = {};
    },
  },
}
</script>