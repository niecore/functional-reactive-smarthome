const R = require("ramda");
const Kefir = require("kefir");
const Devices = require("../model/devices");
const Rooms = require("../model/rooms");
const Lenses = require('../lenses');
const Util = require('../model/util');
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

// presenceInRoomDetected :: String => Boolean
const presenceInRoomDetected = room => R.pipe(
    R.view(Lenses.inputDataLens),
    R.propEq(room, true)
);

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

const getRoomOfMessage = R.pipe(
    R.view(Lenses.inputNameLens),
    Rooms.getRoomOfDevice
);

const input = new Kefir.pool();

const output = input
    .filter(Devices.isMessageFromDevice)
    .filter(isMessageFromMotionSensor)
    .filter(movementDetected)
    .thru(Util.groupBy(getRoomOfMessage))
    .flatMap( groupedStream => {
        return groupedStream
            .map(getRoomOfMessage)
            .flatMapLatest(room => Kefir.constant(R.objOf("presence")(R.objOf(room, true))).merge(Kefir.later(120 * 1000, R.objOf("presence")(R.objOf(room, false)))))
            .skipDuplicates(R.equals);
    });

// isMessageFromPresence :: Msg => Boolean
const isMessageWithPresenceOn = R.pipe(
    R.view(Lenses.inputDataLens),
    R.values,
    R.head
);

module.exports = {
    input,
    output,
    presenceInRoom,
    presenceInRoomDetected,
    getRoomOfPresence,
    isMessageFromPresence,
    isMessageWithPresenceOn
};
