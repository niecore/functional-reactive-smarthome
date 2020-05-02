<template>
  <div class="columns is-mobile">
    <div class="column has-text-left">
      <span>state</span>
    </div>
    <div class="column has-text-right">
      <div class="field">
        <input
          :id="device + '_state_btn'"
          type="checkbox"
          class="switch"
          v-model="checked"
          v-on:change="updateData()"
        />
        <label :for="device + '_state_btn'"></label>
      </div>
    </div>
  </div>
</template>

<script>
const R = require("ramda");

export default {
  props: ["state", "device"],
  name: "State",
  data() {
    return {
      checked: this.state.toUpperCase() === "ON"
    };
  },
  watch: {
    checked: function(newValue) {
      this.state.toUpperCase = newValue.toUpperCase() ? "ON" : "OFF";
    },
    state: function(newValue) {
      this.checked = newValue.toUpperCase() === "ON";
    }
  },
  methods: {
    updateData() {
      this.$socket.emit(
        "frs",
        JSON.stringify(
          R.objOf(this.device, { state: this.checked ? "ON" : "OFF" })
        )
      );
    }
  }
};
</script>

<style scoped></style>
