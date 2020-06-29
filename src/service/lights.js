const R = require("ramda");
const Devices = require("../model/devices");
const Rooms = require("../model/rooms");

// filterStateByDevicesRoom :: String => State => State
const filterStateByDevicesRoom = room => R.pickBy((k, v) => Rooms.deviceIsInRoom(room)(v));

// filterStateByLightType :: State => State
const filterStateByLightType = R.pickBy((k, v) => Devices.deviceHasType("light")(v));

// allLightsOff :: State => boolean
const allLightsOff = R.pipe(
    R.map(R.prop("state")),
    R.map(state => state.toLowerCase() !== "off"),
    R.values,
    R.reduce(R.or, false),
    R.not,
);

const lightState = filterStateByLightType;

const lightStateOfRoom = room => R.pipe(
    lightState,
    filterStateByDevicesRoom(room)
);

const lightsInRoomOff = room => R.pipe(
    lightStateOfRoom(room),
    allLightsOff
);

const getBrightnessOfLight = light => R.pipe(
    lightState,
    R.prop(light),
    R.prop("brightness"),
    R.defaultTo(0)
);

module.exports = {
    lightsInRoomOff,
    getBrightnessOfLight
};
