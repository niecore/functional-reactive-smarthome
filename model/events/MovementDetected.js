const R = require("ramda");
const Kefir = require("kefir");
const Lenses = require('../lenses');

// createMovementDetectedEvent :: Msg => MovementDetected
const createMovementDetectedEvent = msg => {
    const room = getRoomOfMessage(msg);
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

// getRoomOfMessage :: Msg => String
const getRoomOfMessage = R.pipe(
    R.view(Lenses.inputNameLens),
    Rooms.getRoomOfDevice
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


