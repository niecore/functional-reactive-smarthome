const R = require('ramda');
const Devices = require('../config/devices.json');

// knownRooms
const knownDevices = Devices.devices;

// getDeviceByName :: String => Device | undefined
const getDeviceByName = R.prop(R.__, Devices.devices);

// getDevicesOfType :: String >= [Device]
const getDevicesOfType = type => knownDevices
    .filter(R.propEq("type", type));

// deviceHasType :: String => String -> bool
const deviceHasType = type => R.pipe(
    getDeviceByName,
    R.propEq("type", type)
);

// deviceHasInterface :: String => String -> bool
const deviceHasInterface = type => R.pipe(
    getDeviceByName,
    R.propEq("interface", type)
);

module.exports = {
    knownDevices,
    getDeviceByName,
    getDevicesOfType,
    deviceHasType,
    deviceHasInterface
};

