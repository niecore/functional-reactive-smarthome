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

        <Light :state="state" :device="name" v-if="isLight()"/>
        <Etrv :state="state" :device="name" v-if="type === 'etrv'"/>
        <Contact :state="state" :device="name" v-if="type === 'contact'"/>


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
import Contact from "./devices/Contact";
import Etrv from "./devices/Etrv";

export default {
  components: { Etrv, Light, Contact, TypeIcon},
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
          return this.type === "light" || this.type === "etrv" || this.type === "contact"
      }
  },
};
</script>

<style scoped></style>
