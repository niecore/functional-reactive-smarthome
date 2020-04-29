<template>
  <div>
    <div class="container">
      <div v-for="(data, device) in lights" :key="device">
          <Device :state="data" :name="device"></Device>
      </div>
    </div>

  </div>
</template>

<script>

import Device from "../components/Device";

const R = require("ramda");
const Devices = require("./../../../model/devices");
const Rooms = require("./../../../model/rooms");

export default {
    name: "FRS",

    components: {
        Device
    },

    data() {
        return {
            input: {},
            state: {},
            devices: {}
        }
    },
    computed: {
        lights() {
          return R.filter(R.propEq("type", "light"))(this.devices)
        }
    },

    sockets: {
        frs(data) {
            data = JSON.parse(data);
            this.input = data[0];
            this.state = R.mergeDeepRight(data[1], data[0]);

            this.devices = R.pipe(
                R.mapObjIndexed((value, key) => R.assoc("type", Devices.getTypeOfDevice(key), value)),
                R.mapObjIndexed((value, key) => R.assoc("room", Rooms.getRoomOfDevice(key), value)),
            )(this.state);
        }
    }

}

</script>

<style scoped>
  .container{
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px,1fr));
    grid-gap: 0.5em;
  }

  .card{
    height: max-content;
  }
</style>
