const R = require("ramda");
const Service = require("./service");

// filterStateByDevicesRoom :: String => State => State
const filterStateByDevicesRoom = room => R.pickBy((k, v) => Rooms.deviceIsInRoom(room)(v));

// filterStateByLightType :: State => State
const filterStateByMotionSensorType = R.pickBy((k, v) => Devices.deviceHasType("motion_sensor")(v));

const luminosityState = R.map(filterStateByMotionSensorType, Service.state);

const luminosityStateOfRoom = room => R.map(filterStateByDevicesRoom(room), luminosityState);

// allLightsOff :: State => Number
const getMeanLuminosity = R.pipe(
    R.map(R.prop("illuminance_lux")),
    R.values,
    R.mean,
    R.defaultTo(0)
);

// https://docs.microsoft.com/en-us/windows/win32/sensorsapi/understanding-and-interpreting-lux-values
const darkIndoors = 50;
const dimIndoors = 200;
const normalIndoors = 400;
const brightIndoors = 1000;
const dimOutdoors = 5000;
const cloudyOutdoors = 10000;
const directSunlight = 30000;

const luminosityToDark =  luminosity => R.gt(darkIndoors, luminosity);

// meanLuminosityInRoom :: String => Number
const meanLuminosityInRoom = room => R.map(getMeanLuminosity, luminosityStateOfRoom(room));

// roomToDark :: String => Boolean
const isRoomToDark = room => R.map(luminosityToDark, meanLuminosityInRoom(room));

module.exports = {
    isRoomToDark,
};
