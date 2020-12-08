const R = require("ramda");
const Kefir = require("kefir");

const Rooms = require("../model/rooms");
const Devices = require("../model/devices");
const Events = require("./events");

const isLightOnEvent = Events.isEvent("TurnNightLightsOn");

const input = new Kefir.pool();

// isNightLight :: String => boolean
const isNightLight = R.pipe(
    Devices.getDeviceByName,
    R.propOr(true, "direct"),
    R.not
);

// isDimmable :: String => boolean
const isDimmable = Devices.hasFunction("brightness")

const output = input
    .filter(isLightOnEvent)
    .map(lightOnEvent => {

        const nightLightsInRoom = Rooms.getDevicesInRoom(lightOnEvent.room)
            .filter(Devices.isLight)
            .filter(isNightLight)
            .filter(isDimmable);

        const enableLights = nightLightsInRoom
            .map(device_name => R.objOf(device_name, {state: "ON", brightness: 1}));

        return R.reduce(R.mergeLeft(), {}, enableLights);
    });

module.exports = {
    input,
    output
};


