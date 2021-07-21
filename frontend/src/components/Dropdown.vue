<template>
  <Menu as="div" class="relative inline-block text-left">
    <!-- dropdown button, i.e. header user block -->
    <div>
      <MenuButton
          class="inline-flex items-center justify-center w-full rounded-md px-4 py-2 font-semibold">
        <span class="hidden md:inline" v-text="user.username" />
        <img :src="host + user.avatar" alt="Фото пользователя" class="rounded w-12 md:w-14 h-12 md:h-14 ml-2">
      </MenuButton>
    </div>

    <!-- Dropdown -->
    <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
      <!-- Dropdown items is user is authorized -->
      <MenuItems
          class="origin-top-right absolute right-0 mt-3.5 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none dark:bg-main-dark2 border-main-light border"
          v-if="isAuthenticated()"
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
              to="/"
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
            <router-link
              to="/"
              :class="dropdownItemClass"
            >Админ-панель</router-link>
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
          class="origin-top-right absolute right-0 mt-3.5 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none dark:bg-main-dark2 border-main-light border"
          v-else
      >
        <div class="py-1">
          <MenuItem v-slot="{ active }">
            <button
                :class="dropdownItemClass"
                @click="open = true; showAuthorizationModal = true"
            >Войти</button>
          </MenuItem>
          <MenuItem v-slot="{ active }">
            <router-link
                to="/"
                :class="dropdownItemClass"
                @click="open = true; showRegistrationModal = true"
            >Регистрация</router-link>
          </MenuItem>
          <MenuItem v-slot="{ active }">
            <router-link
                :to="{ name: 'users' }"
                :class="dropdownItemClass"
            >
              Пользователи
            </router-link>
          </MenuItem>
        </div>
      </MenuItems>
    </transition>
    <modal
        action="authorization"
        :open="open"
        v-if="showAuthorizationModal"
        @close-modal="closeModal"
        @create-alert="createAlert"
        @load-user="$emit('load-user')"
    />
    <modal
        action="registration"
        :open="open"
        v-if="showRegistrationModal"
        @close-modal="closeModal"
        @create-alert="createAlert"
        @load-user="$emit('load-user')"
    />
  </Menu>
</template>

<script>
import { ref } from 'vue'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import Modal from '@/components/Modal'

export default {
  data() {
    return {
      open: ref(false),
      showAuthorizationModal: false,
      showRegistrationModal: false
    }
  },
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  components: {
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
    Modal
  },
  methods: {
    logout() {
      document.cookie = 'access=; Max-Age=0; path=/'
      document.cookie = 'refresh=; Max-Age=0; path=/'
      this.$emit('load-user')
      this.$emit('create-alert', {
        title: 'Вы успешно вышли из аккаунта.',
        level: 'success'
      })
      this.$router.push('/')
    },
    closeModal() {
      this.showAuthorizationModal = false
      this.showRegistrationModal = false
    },
    createAlert(alert) {
      this.$emit('create-alert', alert)
    }
  },
  computed: {
    dropdownItemClass() {
      return 'hover:bg-gray-50 hover:text-gray-900 text-gray-700 block px-4 py-2 dark:text-gray-50 dark:hover:text-gray-50 dark:hover:bg-main w-full text-left'
    }
  }
}
</script>