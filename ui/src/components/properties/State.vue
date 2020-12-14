<template>
  <div class="columns is-mobile">
    <div class="column has-text-left">
      <span>state</span>
    </div>
    <div class="column has-text-right">
      <div class="field">
        <input
          :id="name + '_state_btn'"
          type="checkbox"
          class="switch"
          v-model="checked"
          v-on:change="updateData()"
        />
        <label :for="name + '_state_btn'"></label>
      </div>
    </div>
  </div>
</template>

<script>
const R = require("ramda");

export default {
  props: ["state", "name"],
  name: "State",
  data() {
    return {
      checked: R.pathOr('OFF', ['state'], this.state).toUpperCase() === "ON"
    };
  },
  watch: {
    state: function(newValue) {
      this.checked = newValue.state.toUpperCase() === "ON";
    }
  },
  methods: {
    updateData() {
      this.$socket.emit(
        "frs",
        JSON.stringify(
          R.objOf(this.name, { state: this.checked ? "ON" : "OFF" })
        )
      );
    }
  }
};
</script>

<style scoped></style>
