const R = require('ramda');
const Rooms = require('../config/rooms.json');
const Devices = require('../model/devices');

// knownRooms
const knownRooms = Rooms.rooms;

// getRoomByName :: String => Room | undefined
const getRoomByName = room => R.find(R.propEq('name', room), knownRooms);

// getDevicesInRoom :: String => [Devices]
const getDevicesInRoom = R.pipe(
        getRoomByName,
        R.propOr([], "devices"),
        R.map(Devices.getDeviceByName)
    );

// getRoomOfDevice :: Device => Room | undefined
const getRoomOfDevice = R.pipe(
    R.prop("name"),

);

// isInRoom :: String -> Device -> bool
const isInRoom = room => device => R.find(R.propEq('name', device.name))(getDevicesInRoom(room)); // todo: beautify


module.exports = {
    getRoomByName,
    getDevicesInRoom,
    isInRoom
};

