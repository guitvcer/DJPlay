<template>
  <div class="flex justify-center py-4">
    <a
      :href="
        `https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${origin}/account/google-oauth2/&prompt=consent&` +
        `response_type=code&client_id=${GOOGLE_CLIENT_ID}&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.` +
        `email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile&access_type=offline`
      "
      class="rounded hover:bg-gray-50 dark:hover:bg-main-dark p-2 mx-0.5 border dark:border-main"
      title="Авторизация через Google"
    >
      <img :src="this.baseURL + '/media/icons/google.svg'" alt="Google" class="w-8 h-8">
    </a>
    <a
      :href="
        `https://oauth.vk.com/authorize?client_id=${VK_CLIENT_ID}&redirect_uri=${origin}/account/vk-oauth2/&display=` +
        `mobile&response_type=code&v=5.59`
      "
      class="rounded hover:bg-gray-50 dark:hover:bg-main-dark p-2 mx-0.5 border dark:border-main"
      title="Авторизация через VK"
    >
      <img :src="this.baseURL + '/media/icons/vk.svg'" alt="VK" class="w-8 h-8">
    </a>
  </div>
</template>

<script>
export default {
  data() {
    return {
      origin: window.location.origin,
      GOOGLE_CLIENT_ID: process.env['VUE_APP_GOOGLE_OAUTH2_PUBLIC'],
      VK_CLIENT_ID: process.env['VUE_APP_VK_OAUTH2_PUBLIC'],
    }
  },
}
</script>