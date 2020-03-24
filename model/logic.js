const Presence = require("../model/presence");
const Devices = require("../model/devices");
const Rooms = require("../model/rooms");
const Lenses = require("../lenses");
const R = require("ramda");

// todo move to other model
// getRoomOfMessage :: Msg => String | undefined
const getRoomOfMessage =  (input) => {
    if (Presence.isMessageFromPresence(input)) {
        return Presence.getRoomOfPresence(input)
    }

    if(Devices.isMessageFromDevice(input)) {
        return Rooms.getRoomOfDevice(R.view(Lenses.inputNameLens)(input))
    }

    return undefined
};

// filterStateByDevicesRoom :: String => State => State
const filterStateByDevicesRoom = room => R.pickBy((k, v) => Rooms.deviceIsInRoom(room)(v));

// getStateOfDeviceInSameRoom :: State => State
const getStateOfDeviceInSameRoom = input => {
    return filterStateByDevicesRoom(
        getRoomOfMessage(input)
    )(R.view(Lenses.stateLens)(input))
};

module.exports = {
    getRoomOfMessage,
    getStateOfDeviceInSameRoom
};
