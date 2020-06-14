const R = require("ramda");
const Kefir = require("kefir");

const Rooms = require("../rooms");
const Devices = require("../devices");

const isLightOnEvent = R.propEq("id", "TurnNightLightsOn");

const input = new Kefir.pool();

// isNightLight :: String => boolean
const isNightLight = R.pipe(
    Devices.getDeviceByName,
    R.propEq("sub_type", "indirect")
);

const output = input
    .filter(isLightOnEvent)
    .map(lightOnEvent => {

        const nightLightsInRoom = Rooms.getDevicesInRoom(lightOnEvent.room)
            .filter(Devices.isLight)
            .filter(isNightLight);

        const enableLights = nightLightsInRoom
            .map(device_name => R.objOf(device_name, {state: "ON", brightness: 1}));

        return R.reduce(R.mergeLeft(), {}, enableLights);
    });

module.exports = {
    input,
    output
};


