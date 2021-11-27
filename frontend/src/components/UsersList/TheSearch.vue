<template>
  <form method="get" class="mb-2" @submit.prevent="submitForm">
    <div class="flex mb-4">
      <input
        type="text"
        placeholder="Поиск"
        id="usersListSearch"
        name="query"
        class="dark:bg-main-dark2 dark:border-main border-2 px-4 py-1.5 w-full md:w-auto border-r-0 rounded-l border-gray-300 text-lg"
        v-model="body.query"
      >
      <button
        type="submit"
        class="dark:border-main border-2 px-4 py-2 rounded-r hover:bg-white border-gray-300 dark:hover:bg-main"
      >
        <search-icon class="h-6 w-6" />
      </button>
    </div>
    <div class="flex flex-col justify-end px-4">
      <div class="flex items-center">
        <label for="online" class="mr-2">Онлайн</label>
        <input type="checkbox" id="online" name="online" class="w-5 h-5" v-model="body.isOnline">
      </div>
      <div
        class="flex items-center"
        v-if="isAuthenticated() && $route.name !== 'friends'"
      >
        <label for="friend" class="mr-2">В друзьях</label>
        <input type="checkbox" id="friend" name="friend" class="w-5 h-5" v-model="body.isFriend">
      </div>
    </div>
  </form>
</template>

<script>
import api from "../../api/index";
import { SearchIcon } from "@heroicons/vue/outline";

export default {
  components: { SearchIcon },
  data() {
    return {
      body: {
        query: '',
        isOnline: false,
        isFriend: (this.$route.name === "friends") ? null : false,
      }
    }
  },
  methods: {
    async submitForm() {
      this.$emit("sent", await api.account.search(body));
    }
  }
}
</script>

<style scoped>
@supports (-webkit-appearance: none) or (-moz-appearance: none) {
  input[type='checkbox'], input[type='radio'] {
    --active: #393e46;
    --active-inner: #fff;
    --focus: 2px #393e46;
    --border: #393e46;
    --border-hover: #393e46;
    --background: #fff;
    --disabled: #f6f8ff;
    --disabled-inner: #e1e6f9;
    -webkit-appearance: none;
    -moz-appearance: none;
    height: 21px;
    outline: none;
    display: inline-block;
    vertical-align: top;
    position: relative;
    margin: 0;
    cursor: pointer;
    border: 1px solid var(--bc, var(--border));
    background: var(--b, var(--background));
    transition: background 0.3s, border-color 0.3s, box-shadow 0.2s;
  }
  input[type='checkbox']:after, input[type='radio']:after {
    content: '';
    display: block;
    left: 0;
    top: 0;
    position: absolute;
    transition: transform var(--d-t, 0.3s) var(--d-t-e, ease), opacity var(--d-o, 0.2s);
  }
  input[type='checkbox']:checked, input[type='radio']:checked {
    --b: var(--active);
    --bc: var(--active);
    --d-o: 0.3s;
    --d-t: 0.6s;
    --d-t-e: cubic-bezier(0.2, 0.85, 0.32, 1.2);
  }
  input[type='checkbox']:disabled, input[type='radio']:disabled {
    --b: var(--disabled);
    cursor: not-allowed;
    opacity: 0.9;
  }
  input[type='checkbox']:disabled:checked, input[type='radio']:disabled:checked {
    --b: var(--disabled-inner);
    --bc: var(--border);
  }
  input[type='checkbox']:disabled + label, input[type='radio']:disabled + label {
    cursor: not-allowed;
  }
  input[type='checkbox']:hover:not(:checked):not(:disabled), input[type='radio']:hover:not(:checked):not(:disabled) {
    --bc: var(--border-hover);
  }
  input[type='checkbox']:focus, input[type='radio']:focus {
    box-shadow: 0 0 0 var(--focus);
  }
  input[type='checkbox']:not(.switch), input[type='radio']:not(.switch) {
    width: 21px;
  }
  input[type='checkbox']:not(.switch):after, input[type='radio']:not(.switch):after {
    opacity: var(--o, 0);
  }
  input[type='checkbox']:not(.switch):checked, input[type='radio']:not(.switch):checked {
    --o: 1;
  }
  input[type='checkbox'] + label, input[type='radio'] + label {
    font-size: 14px;
    line-height: 21px;
    display: inline-block;
    vertical-align: top;
    cursor: pointer;
    margin-left: 4px;
  }
  input[type='checkbox']:not(.switch) {
    border-radius: 7px;
  }
  input[type='checkbox']:not(.switch):after {
    width: 5px;
    height: 9px;
    border: 2px solid var(--active-inner);
    border-top: 0;
    border-left: 0;
    left: 7px;
    top: 4px;
    transform: rotate(var(--r, 20deg));
  }
  input[type='checkbox']:not(.switch):checked {
    --r: 43deg;
  }
  input[type='checkbox'].switch {
    width: 38px;
    border-radius: 11px;
  }
  input[type='checkbox'].switch:after {
    left: 2px;
    top: 2px;
    border-radius: 50%;
    width: 15px;
    height: 15px;
    background: var(--ab, var(--border));
    transform: translateX(var(--x, 0));
  }
  input[type='checkbox'].switch:checked {
    --ab: var(--active-inner);
    --x: 17px;
  }
  input[type='checkbox'].switch:disabled:not(:checked):after {
    opacity: 0.6;
  }
}
</style>