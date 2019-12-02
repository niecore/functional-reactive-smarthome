const R = require('ramda');
const Devices = require('../config/devices.json');

// knownRooms
const knownDevices = Devices.devices;

// getDeviceByName :: String => Device | undefined
const getDeviceByName = device => R.find(R.propEq('name', device), Devices.devices);

// getDevicesOfType :: String >= [Device]
const getDevicesOfType = type => knownDevices
    .filter(R.propEq("type", type));

// deviceHasType :: String => String -> bool
const deviceHasType = type => R.pipe(
    getDeviceByName,
    R.propEq("type", type)
);

module.exports = {
    knownDevices,
    getDeviceByName,
    getDevicesOfType,
    deviceHasType
};

