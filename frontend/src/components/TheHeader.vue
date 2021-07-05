<template>
  <header class="bg-gray-50 dark:bg-main-dark border-b-2 border-main-light">
    <div class="container mx-auto flex justify-between items-center h-full py-3 px-6 md:px-10 lg:px-20" style="max-width: 1750px;">
      <!-- Logo -->
      <div class="h-full">
        <a href="/">
          <h1 class="bg-main text-white text-4xl px-8 py-3 font-monoton rounded border">DJPLAY</h1>
        </a>
      </div>

      <!-- User -->
      <a href="#" class="flex justify-end items-center">
        <div class="font-semibold hidden md:block">Гость</div>
        <div class="flex items-center h-full">
          <img :src="host + '/media/user.png'" alt="Фото пользователя" class="rounded-full w-12 md:w-14 h-12 md:h-14 ml-2">
        </div>
      </a>
    </div>
  </header>
</template>