<template>
  <div>
    {{ state.contact ? "Closed" : "Open" }}
  </div>
</template>

<script>
const Devices = require("../../../../src/model/devices");

const R = require("ramda");
export default {
  name: "Contact",
  props: ["device", "state", "name"],
}
</script>

<style scoped>
</style>
