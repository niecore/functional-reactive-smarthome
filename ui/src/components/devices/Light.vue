<template>
  <div>
    <div v-if="this.$parent.hasFunction('rgb')">
      <Color :color="state.color" :device="device" />
    </div>

    <div v-if="this.$parent.hasFunction('brightness')">
      <Brightness :brightness="state.brightness" :device="device" />
    </div>

    <div v-if="state.state">
      <State :state="state.state" :device="device" />
    </div>
  </div>
</template>

<script>
    import State from "../properties/State";
    import Color from "../properties/Color";
    import Brightness from "../properties/Brightness";

    export default {
        components: { State, Color, Brightness},
        props: ["device", "state"],
        name: "Light"
    }
</script>

<style scoped>

</style>
