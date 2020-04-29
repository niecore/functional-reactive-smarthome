<template>
  <div class="columns">
    <div class="column has-text-left">
      <span>state</span>
    </div>
    <div class="column has-text-right">
      <div class="field">
        <input :id="device + '_state_btn'" type="checkbox" class="switch" v-model="checked" v-on:change="updateData()">
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
                checked: 0
            }
        },
        watch: {
            checked: function (newValue) {
                this.state = newValue ? "ON" : "OFF"
            },
            state: function (newValue) {
                this.checked = newValue === "ON"
            }
        },
        methods : {
            updateData() {
                this.$socket.emit('frs', JSON.stringify(R.objOf(this.device, {state: this.checked ? "ON" : "OFF"})));
            }
        }
    }
</script>

<style scoped>
</style>
