const R = require('ramda');
const Devices = require('../config/devices.json');
const Util = require('./util');

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

const filterMsgByDeviceInterface = interfaceType => R.pipe(
    Util.convertToArray,
    R.filter(input => deviceHasInterface(interfaceType)(input.key)),
    Util.convertFromArray
);

module.exports = {
    knownDevices,
    getDeviceByName,
    getDevicesOfType,
    deviceHasType,
    deviceHasInterface,
    filterMsgByDeviceInterface,
};

