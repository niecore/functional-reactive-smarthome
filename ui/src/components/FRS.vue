<template>
  <div>
    <div class="container">
      <Device v-for="(data, device) in devices" :key="device" :state="data" :name="device"></Device>
    </div>
  </div>
</template>

<script>
import Device from "../components/Device";
const R = require("ramda");

export default {
  name: "FRS",

  components: {
      Device
  },

  data() {
    return {
      input: {},
      state: {},
      devices: {}
    };
  },

  sockets: {
    frs(data) {
      data = JSON.parse(data);
      this.input = data[0];
      this.state = R.mergeDeepRight(data[1], data[0]);
      this.devices = this.state
    }
  }
};
</script>

<style scoped>
.container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-gap: 0.5em;
}

.card {
  height: max-content;
}
</style>
