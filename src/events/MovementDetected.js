const R = require("ramda");
const Kefir = require("kefir");

const Devices = require("../model/devices");
const Lenses = require('../lenses');
const Rooms = require("../model/rooms");

// createMovementDetectedEvent :: Msg => MovementDetected
const createMovementDetectedEvent = msg => {
    const room = Rooms.getRoomOfMessage(msg);
    return ({id: "MovementDetected", room: room});
};

// occupancyLens :: Lens
const occupancyLens = R.compose(Lenses.inputDataLens, R.lensPath(["occupancy"]));

// occupancyLens :: Msg => Boolean
const movementDetected = R.view(occupancyLens);

// isMessageFromMotionSensor :: Msg => Boolean
const isMessageFromMotionSensor = R.pipe(
    R.view(Lenses.inputNameLens),
    Devices.deviceHasType("motion_sensor")
);

const input = new Kefir.pool();

const output = input
    .filter(isMessageFromMotionSensor)
    .filter(movementDetected)
    .map(createMovementDetectedEvent);

module.exports = {
    input,
    output
};


