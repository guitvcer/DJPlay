<template>
  <div class="block sm:flex sm:items-center items-center mb-2 sm:mb-0 my-1">
    <label
      :class="[field.type === 'checkbox' ? 'mr-2' : 'hidden sm:inline ', 'w-full sm:w-6/12 flex-shrink-0']"
      :for="field.name"
    >{{ field.placeholder }}</label>

    <select
      :name="field.id"
      :id="field.name"
      v-if="field.type === 'select'"
      class="py-1 px-2 w-full sm:w-6/12 border border-main rounded dark:bg-main"
    >
      <option v-for="(option, index) in field.options" :key="index" :value="option.value">{{ option.title }}</option>
    </select>

    <input
      :type="field.type"
      :name="field.name"
      :id="field.name"
      :value="field.value"
      @click="check"
      class="switch"
      v-else-if="field.type === 'checkbox'"
    >

    <input
      :type="field.type"
      :name="field.name"
      :id="field.name"
      :placeholder="field.placeholder"
      :maxlength="field.max_length"
      :value="field.value"
      class="py-1 px-2 w-full sm:w-6/12 border border-main rounded dark:bg-main"
      v-else
    >
  </div>
</template>

<script>
export default {
  props: {
    field: {
      type: Object,
      required: true
    }
  },
  methods: {
    check(event) {
      if (event.target.value === 'true') event.target.value = 'false'
      else event.target.value = 'true'
    }
  },
  mounted() {
    if (this.field.required)
      document.querySelector('#' + this.field.name).setAttribute('required', "")

    let options = document.querySelectorAll('option')

    if (this.field.type === 'select')
      for (let option of options) {
        if (option.value === this.field.value || option.value === '' && this.field.value === null)
          option.setAttribute('selected', '')
      }

    if (this.field.type === 'checkbox') {
      let checkbox = document.querySelector('#isPrivate')

      if (this.field.value === true) checkbox.setAttribute('checked', '')
    }
  }
}
</script>

<style scoped>@supports (-webkit-appearance: none) or (-moz-appearance: none) {
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