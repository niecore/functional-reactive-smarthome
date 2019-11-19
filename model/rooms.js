const R = require('ramda');
const Rooms = require('../config/rooms.json');

// knownRooms
const knownRooms = Rooms.rooms;

// getKnownRoom :: String => Room | undefined
const getKnownRoom = room => R.find(R.propEq('name', room), knownRooms);

// getDevicesFromRoom :: Room => [String]
const getDevicesFromRoom = R.prop("devices");

// roomDeviceList :: String => [String]
const roomDeviceList = room => R.compose(getDevicesFromRoom, getKnownRoom(room));

// isInRoom :: String -> Device -> bool
const isInRoom = room => device => R.includes(device, roomDeviceList(room));

module.exports = {
    knownRooms: knownRooms,
};

