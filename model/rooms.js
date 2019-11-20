const R = require('ramda');
const Rooms = require('../config/rooms.json');
const Devices = require('../config/devices.json');

// knownRooms
const knownRooms = Rooms.rooms;

// getKnownRoom :: String => Room | undefined
const getKnownRoom = room => R.find(R.propEq('name', room), knownRooms);

// getDevicesFromRoom :: Room => [String]
const getDevicesFromRoom = R.pipe(
        R.prop("devices"),
        R.map(getDeviceByName)
    );

// roomDeviceList :: String => [String]
const roomDeviceList = R.pipe(
        getKnownRoom,
        getDevicesFromRoom,
    );

// isInRoom :: String -> Device -> bool
const isInRoom = room => device => R.includes(device, roomDeviceList(room));

module.exports = {
    knownRooms: knownRooms,
};

