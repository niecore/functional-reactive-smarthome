<template>
  <div>
    <State :state="state" :name="name" />

    <div v-if="this.$parent.hasFunction('rgb')">
      <Color :state="state" :name="name" />
    </div>

    <div v-if="this.$parent.hasFunction('brightness')">
      <Brightness :state="state" :name="name" />
    </div>
  </div>
</template>

<script>
    import State from "../properties/State";
    import Color from "../properties/Color";
    import Brightness from "../properties/Brightness";

    export default {
        components: { State, Color, Brightness},
        props: ["device", "state", "name"],
        name: "Light"
    }
</script>

<style scoped>

</style>
