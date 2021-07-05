<template>
  <form :action="action" method="get" class="mb-2">
    <div class="flex mb-4">
      <input
          type="text"
          placeholder="Поиск"
          id="query"
          name="query"
          class="dark:bg-main-dark2 dark:border-main border-2 px-4 py-1.5 w-full md:w-auto border-r-0 rounded-l border-gray-300 text-lg"
      >
      <button type="button" class="dark:border-main border-2 px-4 py-2 rounded-r hover:bg-white border-gray-300">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </div>
    <div class="flex flex-col justify-end px-4">
      <div class="flex items-center">
        <label for="online" class="mr-2">Онлайн</label>
        <input type="checkbox" id="online" name="online" class="w-5 h-5">
      </div>
      <div class="flex items-center">
        <label for="online" class="mr-2">В друзьях</label>
        <input type="checkbox" id="friend" name="friend" class="w-5 h-5">
      </div>
    </div>
  </form>
</template>

<script>
export default {
  props: {
    action: {
      type: String,
      required: true
    }
  }
}
</script>