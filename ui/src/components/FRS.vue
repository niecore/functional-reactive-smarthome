<template>
  <div>
    <div class="tag-container box">
      <div class="tags">
        <a v-for="tag in filter_rooms" @click="clickFilterRoom(tag)" :key="tag" v-bind:class="filterActive(tag) ? '' : 'is-light'" class="tag is-large is-primary tag-room">{{tag}}</a>
        <a v-for="tag in filter_types" @click="clickFilterType(tag)" :key="tag" v-bind:class="filterActive(tag) ? '' : 'is-light'" class="tag is-large is-info tag-type">{{tag}}</a>
        <a class="tag is-large is-danger" v-bind:class="anyFilterActive() ? '' : 'is-light'" @click="resetFilters()">reset filter</a>
      </div>
    </div>
    <div class="devices container">
      <Device v-for="(data, device) in devices" :state="state[device]" :key="device" :device="data" :name="device"
              :enabled="isDeviceEnabled(data)"></Device>
    </div>
  </div>
</template>

<script>
import Device from "../components/Device";

const Devices = require("../../../src/model/devices");
const Rooms = require("../../../src/model/rooms");
const R = require("ramda");

export default {
  name: "FRS",

  components: {
    Device
  },
  created() {
    this.devices = Devices.knownDevices

    for (const [key, _] of Object.entries(this.devices)) {
      this.devices[key].room = Rooms.getRoomOfDevice(key);
      this.devices[key].enabled = this.isDeviceEnabled(this.devices[key]);
    }
  },

  data() {
    return {
      input: {},
      state: {},
      devices: {},
      filter_rooms: [
        "hallway",
        "kitchen",
        "living_room",
        "junk_room",
        "garden",
        "staircase",
        "office",
        "bathroom",
        "bedroom",
        "laundry_room"
      ],
      filter_types: ["etrv", "light", "contact"],
      active_filters_type: [],
      active_filters_room: [],
      filters_active: false
    };
  },
  methods: {
    isDeviceEnabled(device) {

      const filterByType = R.length(this.active_filters_type) > 0;
      const filterByRoom = R.length(this.active_filters_room) > 0;
      const filterByBoth = filterByType && filterByRoom;

      const devicesTypeActive = R.includes(device.type, this.active_filters_type);
      const deviceRoomActive = R.includes(device.room, this.active_filters_room);
      const deviceBothActive = devicesTypeActive && deviceRoomActive;

      return filterByBoth
          ? deviceBothActive
          : filterByType
              ? devicesTypeActive
              : filterByRoom
                  ? deviceRoomActive
                  : true;
    },

    resetFilters() {
      this.active_filters_type = [];
      this.active_filters_room = [];
    },

    clickFilterRoom(tag) {
      if(this.filterActive(tag)) {
        this.active_filters_room = R.filter(element => element !== tag, this.active_filters_room);
      } else {
        this.active_filters_room.push(tag);
      }
      const devicesTypeActive = R.includes(device.type, this.active_filters_type);
      const deviceRoomActive = R.includes(device.room, this.active_filters_room);
      const deviceBothActive = devicesTypeActive && deviceRoomActive;

      return filterByBoth
          ? deviceBothActive
          : filterByType
              ? devicesTypeActive
              : filterByRoom
                  ? deviceRoomActive
                  : true;
    },
    clickFilterType(tag) {
      if(this.filterActive(tag)) {
        this.active_filters_type = R.filter(element => element !== tag, this.active_filters_type);
      } else {
        this.active_filters_type.push(tag);
      }
    },

    filterActive(tag) {
      return R.includes(tag, this.active_filters_type + this.active_filters_room);
    },

    anyFilterActive() {
      return R.length(this.active_filters_type) + R.length(this.active_filters_room) > 0;
    }
  },
  sockets: {
    frs(data) {
      data = JSON.parse(data);
      this.input = data[0];
      this.state = R.mergeDeepRight(data[1], data[0]);
    }
  }
};
</script>

<style scoped>
.container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-gap: 0.5em;
}

.card {
  height: max-content;
}
</style>
