const R = require("ramda");
const Kefir = require("kefir");

const Rooms = require("../rooms");
const Devices = require("../devices");

const isLightOnEvent = R.propEq("id", "TurnLightsOn");

const input = new Kefir.pool();

const output = input
    .filter(isLightOnEvent)
    .map(lightOnEvent => {
        const lightsInRoom = Rooms.getDevicesInRoom(lightOnEvent.room)
            .filter(Devices.isLight);

        const enableLights = lightsInRoom
            .map(device_name => R.objOf(device_name, {state: "ON", brightness: 255}));

        return R.reduce(R.mergeLeft(), {}, enableLights);
    });

module.exports = {
    input,
    output
};


