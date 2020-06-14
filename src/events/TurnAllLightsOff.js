const R = require("ramda");
const Kefir = require("kefir");

const Rooms = require("../model/rooms");
const Devices = require("../model/devices");

const isLightOffEvent = R.propEq("id", "TurnAllLightsOff");

const input = new Kefir.pool();

const output = input
    .filter(isLightOffEvent)
    .map(lightOnEvent => {
        const lightsInRoom = Rooms.getDevicesInRoom(lightOnEvent.room)
            .filter(Devices.isLight);

        const disableLights = lightsInRoom
            .map(device_name => R.objOf(device_name, {state: "OFF"}));

        return R.reduce(R.mergeLeft(), {}, disableLights);
    });

module.exports = {
    input,
    output
};


