const R = require('ramda');
const Rooms = require('../config/rooms.json');
const Lenses = require('../lenses');

// knownRooms
const knownRooms = Rooms.rooms;

// getRoomByName :: String => Room | undefined
const getRoomByName = R.prop(R.__, knownRooms);

// getDevicesInRoom :: String => [Devices]
const getDevicesInRoom = R.pipe(
    getRoomByName,
    R.propOr([], "devices")
);

// getRoomOfDevice :: String -> String | undefined
const getRoomOfDevice = device => R.head(R.keys(R.filter(
    R.includes(device),
    R.reject(R.isNil, R.map(R.prop("devices"), knownRooms))
)));

// deviceIsInRoom :: String -> String -> Boolean
const deviceIsInRoom = room => R.pipe(
    getRoomOfDevice,
    R.equals(room)
);

// getRoomOfMessage :: Msg => String
const getRoomOfMessage = R.pipe(
    R.view(Lenses.inputNameLens),
    getRoomOfDevice
);

// filterStateByDevicesRoom :: String => State => State
const filterStateByDevicesRoom = room => R.pickBy((k, v) => deviceIsInRoom(room)(v));

// getStateOfDeviceInSameRoom :: State => State
const getStateOfDeviceInSameRoom = input => {
    return filterStateByDevicesRoom(
        R.pipe(
            R.view(Lenses.inputNameLens),
            getRoomOfDevice
        )(input)
    )(R.view(Lenses.stateLens)(input))
};

module.exports = {
    getRoomByName,
    getRoomOfMessage,
    getDevicesInRoom,
    getStateOfDeviceInSameRoom,
    getRoomOfDevice,
    deviceIsInRoom
};

