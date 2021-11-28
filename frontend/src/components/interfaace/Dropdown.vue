<template>
  <Menu as="div" class="relative inline-block text-left">
    <!-- dropdown button, i.e. header user block -->
    <div>
      <MenuButton
          class="inline-flex items-center justify-center w-full rounded-md px-4 py-2 font-semibold">
        <span id="username" class="hidden md:inline" v-text="this.user.username" />
        <div
          :style="'background-image: url(' + this.baseURL + this.user.avatar + '); background-size: 100% 100%;'"
          class="rounded w-12 md:w-14 h-12 md:h-14 ml-2 flex justify-end items-end"
        >
          <div v-if="this.user.username !== 'Гость'" class="w-4 h-4 rounded bg-green-500"></div>
        </div>
      </MenuButton>
    </div>

    <!-- Dropdown -->
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
      class="z-50"
    >
      <!-- Dropdown items is user is authorized -->
      <MenuItems
        class="origin-top-right absolute right-0 mt-3.5 px-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none dark:bg-main-dark border-gray-600 border"
        v-if="user.username !== 'Гость'"
      >
        <div class="py-1">
          <MenuItem v-slot="{ active }">
            <router-link
              :to="{ name: 'userProfile' }"
              :class="dropdownItemClass"
            >Профиль</router-link>
          </MenuItem>
          <MenuItem v-slot="{ active }">
            <router-link
              :to="{ name: 'chats' }"
              :class="dropdownItemClass"
            >Сообщения</router-link>
          </MenuItem>
          <MenuItem v-slot="{ active }">
            <router-link
              :to="{ name: 'users' }"
              :class="dropdownItemClass"
            >Пользователи
            </router-link>
          </MenuItem>
          <MenuItem v-slot="{ active }">
            <router-link
              :to="{ name: 'editProfile' }"
              :class="dropdownItemClass"
            >Изменить профиль</router-link>
          </MenuItem>
        </div>
        <div class="py-1">
          <MenuItem v-slot="{ active }">
            <button
              @click="logout"
              :class="dropdownItemClass"
            >Выйти</button>
          </MenuItem>
        </div>
      </MenuItems>

      <!-- and if user is not authorized -->
      <MenuItems
        class="origin-top-right absolute right-0 mt-3.5 px-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none dark:bg-main-dark border-gray-600 border"
        v-else
      >
        <div class="py-1">
          <MenuItem v-slot="{ active }">
            <button
              :class="dropdownItemClass"
              @click="updateModalAction('authorization'); updateOpenModal(true)"
            >Войти</button>
          </MenuItem>
          <MenuItem v-slot="{ active }">
            <button
              :class="dropdownItemClass"
              @click="updateModalAction('registration'); updateOpenModal(true)"
            >Регистрация</button>
          </MenuItem>
          <MenuItem v-slot="{ active }">
            <router-link
              :to="{ name: 'users' }"
              :class="dropdownItemClass"
            >Пользователи</router-link>
          </MenuItem>
        </div>
      </MenuItems>
    </transition>
  </Menu>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import { ref } from "vue";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import Modal from "./Modal.vue";

export default {
  data() {
    return {
      dropdownItemClass:
        "hover:bg-main rounded hover:text-gray-200 text-gray-700 block px-4 py-2 dark:text-gray-50 " +
        "dark:hover:text-gray-50 dark:hover:bg-main-dark2 w-full text-left",
    }
  },
  computed: mapGetters(["user"]),
  components: { Menu, MenuButton, MenuItem, MenuItems, Modal },
  methods: {
    ...mapActions(["logout"]),
    ...mapMutations(["updateOpenModal", "updateModalAction"]),
    ref,
  }
}
</script>