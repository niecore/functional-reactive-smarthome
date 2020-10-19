<template>
  <div>
    <div v-if="this.$parent.hasFunction('rgb')">
      <Color :color="this.$parent.state.color" :device="this.$parent.name" />
    </div>

    <div v-if="this.$parent.hasFunction('brightness')">
      <Brightness :brightness="this.$parent.state.brightness" :device="this.$parent.name" />
    </div>

    <div v-if="this.$parent.state.state">
      <State :state="this.$parent.state.state" :device="this.$parent.name" />
    </div>
  </div>
</template>

<script>
    import State from "../properties/State";
    import Color from "../properties/Color";
    import Brightness from "../properties/Brightness";

    export default {
        components: { State, Color, Brightness},
        name: "Etrv"
    }
</script>

<style scoped>

</style>
