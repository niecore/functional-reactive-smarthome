const R = require('ramda');
const Devices = require('../config/devices.json');

// getDeviceByName :: String => Device | undefined
const getDeviceByName = device => R.find(R.propEq('name', device), Devices.devices);

module.exports = {
    getDeviceByName: getDeviceByName,
};

