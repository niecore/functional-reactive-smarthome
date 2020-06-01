const Lenses = require('../lenses');
const Devices = require("../devices");
const Rooms = require("../rooms");

const input = new Kefir.pool();

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

const stateStream = input
    .map(R.view(Lenses.stateLens));

const lightStateStream = stateStream
    .map(filterStateByLightType);

const lightStateOfRoomProperty = room => lightStateStream
    .filter(filterStateByDevicesRoom(room))
    .toProperty();

const lightsInRoomOff = room => lightStateOfRoomProperty(room)
    .map(allLightsOff);

module.exports = {
    input,
    lightsInRoomOff
};
