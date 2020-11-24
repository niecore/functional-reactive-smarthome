<template>
  <div>
    {{state.contact ? "Closed" : "Open"}}
  </div>
</template>

<script>
    const R = require("ramda");
    export default {
        name: "Contact",
        props: ["device", "state"],
        data: () => ({
            door: Devices.getDeviceByName(device).sub_type === "door",
            window: Devices.getDeviceByName(device).sub_type === "window"
        }),
    }
</script>

<style scoped>
</style>
