const R = require("ramda");
const Automations = require('../config/automations.json');
const Devices = require("../model/devices");
const Rooms = require("../model/rooms");
const Lenses = require('../lenses');
const Light = require('../model/light');
const Routes = require('../router');

// occupancyLens :: Lens
const occupancyLens = R.compose(Lenses.inputDataLens, R.lensPath(["occupancy"]));

// occupancyLens :: Msg => Boolean
const movementDetected = R.view(occupancyLens);

// isMessageFromMotionSensor :: Msg => Boolean
const isMessageFromMotionSensor = R.pipe(
    R.view(Lenses.inputNameLens),
    Devices.deviceHasType("motion_sensor")
);

// isMessageFromRoomWithMotionLight :: Msg => Boolean
const isMessageFromRoomWithMotionLight = R.pipe(
    R.view(Lenses.inputNameLens),
    Rooms.getRoomOfDevice,
    R.includes(R.__, R.keys(Automations.automations.motionLight.rooms))
);

const getRoomOfMessage = R.pipe(
    R.view(Lenses.inputNameLens),
    Rooms.getRoomOfDevice
);

const motionLight = Routes.input
    .filter(isMessageFromMotionSensor)
    .filter(isMessageFromRoomWithMotionLight)
    .filter(movementDetected)
    .groupBy(getRoomOfMessage)
    .flatMap(function(groupedStream) {
        return groupedStream.flatMapLatest(Light.setAdaptiveBrightnessInRoom)
    });

Routes.output.plug(motionLight);

module.exports = {
    isMessageFromMotionSensor,
    isMessageFromRoomWithMotionLight,
    movementDetected,
};

