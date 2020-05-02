<template>
  <div class="columns">
    <div class="column has-text-left">
      <span>brigthness</span>
    </div>
    <div class="column has-text-right">
      <input
        class="slider is-fullwidth"
        step="1"
        min="0"
        max="255"
        v-model="brightness"
        v-on:change="updateData()"
        type="range"
      />
    </div>
  </div>
</template>

<script>
const R = require("ramda");

export default {
  props: ["brightness", "device"],
  name: "State",
  methods: {
    updateData() {
      this.$socket.emit(
        "frs",
        JSON.stringify(R.objOf(this.device, { brightness: this.brightness }))
      );
    }
  }
};
</script>

<style scoped></style>
