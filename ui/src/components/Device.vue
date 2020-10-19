<template>
  <div v-if="isEnabled()" class="card">
    <header class="card-header">
      <div class="card-header-title">
        {{ name }}
      </div>

      <div class="card-header-icon">
        <TypeIcon :type="data.type" />
      </div>
    </header>

    <div class="card-content">
      <div class="content">

        <Light v-if="isLight()"></Light>
        <Etrv v-if="type == 'etrv'"></Etrv>


        <cite class="is-divider">{{ data.description }}</cite>
      </div>
    </div>
  </div>
</template>

<script>
import TypeIcon from "./TypeIcon";


const Devices = require("../../../src/model/devices");
const Rooms = require("../../../src/model/rooms");

import Light from "./devices/Light";
import Etrv from "./devices/Etrv";

export default {
  components: { Etrv, Light, TypeIcon},
  props: ["state", "name"],
  name: "Device",
  data() {
    return {
        data: Devices.getDeviceByName(this.name),
        type: Devices.getTypeOfDevice(this.name),
        room: Rooms.getRoomOfDevice(this.name),
    };
  },
  methods: {
      isLight() {
         return Devices.isLight(this.name)
      },
      hasFunction(feature) {
        return Devices.hasFunction(feature)(this.name)
      },
      isEnabled(){
          return this.type === "light" || this.type === "etrv"
      }
  },
};
</script>

<style scoped></style>
