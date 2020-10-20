<template>
  <div>
    <div v-if="this.$parent.hasFunction('rgb')">
      <Color :color="this.state.color" :device="this.name" />
    </div>

    <div v-if="this.$parent.hasFunction('brightness')">
      <Brightness :brightness="this.state.brightness" :device="this.name" />
    </div>

    <div v-if="this.state.state">
      <State :state="this.state.state" :device="this.name" />
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
