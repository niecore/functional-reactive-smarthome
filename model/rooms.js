const R = require('ramda');
const Rooms = require('../config/rooms.json');
const Devices = require('../model/devices');

// knownRooms
const knownRooms = Rooms.rooms;

// getRoomByName :: String => Room | undefined
const getRoomByName = R.prop(R.__, knownRooms);

// getDevicesInRoom :: String => [Devices]
const getDevicesInRoom = R.pipe(
        getRoomByName,
        R.propOr([], "devices")
    );

module.exports = {
    getRoomByName,
    getDevicesInRoom
};

