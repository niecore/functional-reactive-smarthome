<template>
  <div v-if="isEnabled() && isSupportedType()" class="card">
    <header class="card-header">
      <div class="card-header-title">
        {{ name }}
      </div>

      <div class="card-header-icon">
        <TypeIcon :type="device.type" />
      </div>
    </header>

    <div class="card-content">
      <div class="content">

        <Light :device="device" :state="state" :name="name" v-if="isLight()"/>
        <Etrv :device="device" :state="state" :name="name" v-if="device.type === 'etrv'"/>
        <Contact :device="device" :state="state" :name="name" v-if="device.type === 'contact'"/>

        <cite class="is-divider">{{ device.description }}</cite>
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
  props: ["device", "state", "name", "enabled"],
  name: "Device",

  methods: {
      isLight() {
         return Devices.isLight(this.name)
      },
      hasFunction(feature) {
        return Devices.hasFunction(feature)(this.name)
      },
      isEnabled(){
        return this.enabled
      },
      isSupportedType() {
        return this.device.type === "etrv" || this.isLight() || this.device.type === "contact"
      }
  },
};
</script>

<style scoped></style>
