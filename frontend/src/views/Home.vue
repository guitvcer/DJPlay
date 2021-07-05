<template>
  <section class="flex justify-center flex-wrap">
    <div class="bg-gray-50 dark:bg-main-dark dark:hover:bg-main-dark rounded hover:bg-white pt-8 pb-24 px-16 flex flex-col items-center mx-5 my-4">
      <img :src="host + '/media/gomoku.png'" alt="Гомоку" class="w-60 mb-10">
      <h3 class="font-bold text-3xl mb-4">Гомоку</h3>
      <a href="#" class="border-main border px-3 py-2 rounded text-center hover:bg-main hover:text-white dark:bg-main-dark2">Играть</a>
    </div>
    <div class="bg-gray-50 dark:bg-main-dark dark:hover:bg-main-dark rounded hover:bg-white pt-8 pb-24 px-16 flex flex-col items-center mx-5 my-4">
      <img :src="host + '/media/chess.png'" alt="Шахматы" class="w-60 mb-10">
      <h3 class="font-bold text-3xl mb-4">Шахматы</h3>
      <a href="#" class="border-main border px-3 py-2 rounded text-center hover:bg-main hover:text-white dark:bg-main-dark2">Играть</a>
    </div>
  </section>
</template>

<script>
export default {
  props: {
    host: {
      type: String,
      required: true
    }
  }
}
</script>