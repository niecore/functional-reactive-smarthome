const R = require("ramda");
const Bacon = require("baconjs");
const Devices = require("../model/devices");
const Rooms = require("../model/rooms");
const Lenses = require('../lenses');
const Hub = require('../hub');

// occupancyLens :: Lens
const occupancyLens = R.compose(Lenses.inputDataLens, R.lensPath(["occupancy"]));

// occupancyLens :: Msg => Boolean
const movementDetected = R.view(occupancyLens);

// isMessageFromMotionSensor :: Msg => Boolean
const isMessageFromMotionSensor = R.pipe(
    R.view(Lenses.inputNameLens),
    Devices.deviceHasType("motion_sensor")
);

// presenceInRoom :: String => Boolean
const presenceInRoom = room => R.has(room);

// presenceDetected :: String => Boolean
const presenceDetected = room => R.propEq(room, true);

// getRoomOfPresence :: Msg => String
const getRoomOfPresence = R.pipe(
    R.view(Lenses.inputDataLens),
    R.keys,
    R.head
);

// isMessageFromPresence :: Msg => Boolean
const isMessageFromPresence = R.pipe(
    R.view(Lenses.inputNameLens),
    R.equals("presence")
);

const presence = Hub.input
    .filter(Devices.isMessageFromDevice)
    .filter(isMessageFromMotionSensor)
    .filter(movementDetected)
    .map(R.view(Lenses.inputNameLens))
    .map(Rooms.getRoomOfDevice)
    .flatMapLatest( room => Bacon.once(R.objOf("presence")(R.objOf(room, true))).merge(Bacon.later(90 * 1000, R.objOf("presence")(R.objOf(room, false)))));

Hub.update.plug(presence);

module.exports = {
    presence,
    presenceInRoom,
    presenceDetected,
    getRoomOfPresence,
    isMessageFromPresence
};
