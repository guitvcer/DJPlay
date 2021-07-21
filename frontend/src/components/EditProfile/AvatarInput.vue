<template>
  <div>
    <input
        id="avatar"
        name="avatar"
        type="file"
        accept="image/*"
        class="hidden"
        ref="file"
        data-clear="off"
        @change="change"
    />
    <div
        :class="['h-full w-full bg-black bg-opacity-0 hover:bg-opacity-25 transition duration-200 flex items-center justify-center', (value) ? 'bg-opacity-25': '']"
        :style="avatarStyle"
    >
      <button
          type="button"
          @click="browse()"
          class="rounded hover:bg-white hover:bg-opacity-25 p-2 focus:outline-none text-white transition duration-200"
      >
        <icon name="camera" class="h-6 w-6"></icon>
      </button>
      <button
          type="button"
          v-if="newFile"
          @click="remove()"
          class="rounded hover:bg-white hover:bg-opacity-25 p-2 focus:outline-none text-white transition duration-200"
      >
        <icon name="x" class="h-6 w-6"></icon>
      </button>
    </div>
  </div>
</template>

<script>
import Icon from "./Icon";

export default {
  props: {
    defaultSrc: String,
    avatar: String
  },
  watch: {
    value(file) {
      if (!file) {
        this.src = this.defaultSrc;
        this.$refs.file.value = "";
      } else {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
          this.src = e.target.result;
        };
      }
    },
  },
  data() {
    return {
      src: this.defaultSrc,
      value: null,
      newFile: this.avatar !== this.defaultSrc
    };
  },
  methods: {
    browse() {
      this.$refs.file.click();
    },
    remove() {
      this.value = null
      this.src = this.defaultSrc
      this.newFile = false
      this.$refs.file.dataset.clear = 'on'
    },
    change(e) {
      this.$emit("input", e.target.files[0]);
      this.value = e.target.files[0]
      this.newFile = true
    },
  },
  components: {
    Icon,
  },
  mounted() {
    if (this.newFile) this.src = this.avatar
  },
  computed: {
    avatarStyle() {
      return `background-image: linear-gradient(rgba(0,0,0,.2), rgba(0,0,0,.2)), url(${this.src}); background-size: 100%;`
    }
  }
};
</script>