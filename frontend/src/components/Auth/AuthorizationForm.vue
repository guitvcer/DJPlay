<template>
  <form action="" method="post">
    <div class="px-4 py-12">
      <h3 class="text-center text-4xl font-semibold">Вход в аккаунт</h3>
      <div class="flex flex-col mt-12">
        <input type="text" name="username" id="username" placeholder="Имя пользователя" class="border border-main my-1 rounded px-2 py-2 dark:bg-main">
        <input type="password" name="password" id="password" placeholder="Пароль" class="border border-main my-1 rounded px-2 py-2 dark:bg-main">
      </div>
    </div>
    <div class="bg-gray-50 dark:bg-main-dark py-3 px-6 flex flex-row-reverse">
      <button
          type="submit"
          class="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-main text-base text-white hover:bg-main-dark ml-3 w-auto text-sm dark:bg-gray-100 dark:text-black"
          @click="$emit('close-modal')">Войти</button>
      <button
          type="button"
          class="inline-flex justify-center rounded-md border border-main shadow-sm px-4 py-2 bg-white text-base text-gray-700 hover:bg-gray-50 mt-0 ml-3 w-auto text-sm dark:bg-red-500 dark:text-gray-50"
          @click="$emit('close-modal')"
          ref="cancelButtonRef">Отмена</button>
    </div>
  </form>
</template>