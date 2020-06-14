const R = require("ramda");
const Devices = require("../model/devices");
const Rooms = require("../model/rooms");
const Service = require("./service");

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

const lightState = R.map(filterStateByLightType, Service.state);

const lightStateOfRoom = room => R.map(filterStateByDevicesRoom(room), lightState);

const lightsInRoomOff = room => R.map(allLightsOff, lightStateOfRoom(room));

const getBrightnessOfLight = light => R.pipe(
    R.prop(light),
    R.prop("brightness"),
    R.defaultTo(0)
)(lightState);

module.exports = {
    lightsInRoomOff,
    getBrightnessOfLight
};
