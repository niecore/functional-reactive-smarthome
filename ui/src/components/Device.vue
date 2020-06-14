<template>
  <div class="card">
    <header class="card-header">
      <div class="card-header-title">
        {{ name }}
      </div>

      <div class="card-header-icon">
        <TypeIcon :type="type" />
      </div>
    </header>

    <div class="card-content">
      <div class="content">
        <div v-if="state.color">
          <Color :color="state.color" :device="name" />
        </div>

        <div v-if="state.brightness">
          <Brightness :brightness="state.brightness" :device="name" />
        </div>

        <div v-if="state.state">
          <State :state="state.state" :device="name" />
        </div>

        <cite class="is-divider">{{ description }}</cite>
      </div>
    </div>
  </div>
</template>

<script>
import TypeIcon from "./TypeIcon";
import State from "./properties/State";
import Color from "./properties/Color";
import Brightness from "./properties/Brightness";

const Devices = require("../../../src/model/devices");

export default {
  components: { Color, TypeIcon, State, Brightness },
  props: ["state", "name"],
  name: "Device",
  data() {
    return {
      description: Devices.getDescriptionOfDevice(this.name)
    };
  }
};
</script>

<style scoped></style>
