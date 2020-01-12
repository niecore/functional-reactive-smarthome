const Automations = require('../config/automations.json');
const Zigbee = require("../interfaces/zigbee");
const Groups = require("../model/groups");
const Devices = require("../model/devices");
const Rooms = require("../model/rooms");
const R = require("ramda");
const Routes = require('../router');
const Bacon = require('baconjs');
const {getSunrise, getSunset} = require('sunrise-sunset-js');

const occupancyLens = R.compose(Routes.inputDataLens, R.lensPath(["occupancy"]));

const movementDetected = R.view(occupancyLens);

const isMessageFromMotionSensor = R.pipe(
    R.view(Routes.inputNameLens),
    Devices.deviceHasType("motion_sensor")
);

const isMessagefromRoomWithMotionLight = R.pipe(
    R.view(Routes.inputNameLens),
    Rooms.getRoomOfDevice,
    R.includes(R.__, R.keys(Automations.automations.motionLight.rooms))
);

const isMessagefromRoomWithNightLight = R.pipe(
    R.view(Routes.inputNameLens),
    Rooms.getRoomOfDevice,
    R.prop(R.__, Automations.automations.motionLight.rooms),
    R.propOr(false, "nightLight")
);

//////////////////////////////////////////////
//
// Section has to be moved to light controller
//
//////////////////////////////////////////////

const timeInNightTime = date => date < getSunrise(50.6, 8.7, date);
const nightTime = R.always(timeInNightTime(new Date()));


// setBrightnessForDevice :: Number => String =>String
const setBrightnessForDevice = level => device => R.objOf(device, setBrightness(level));

const setBrightness = level => {
    return {
        state: "on",
        brightness: level,
        transition: 1,
    };
};

const timedLightOnStream = duration => brightness => device => Bacon.once(setBrightnessForDevice(brightness)(device)).merge(Bacon.later(duration * 1000, setBrightnessForDevice(0)(device)));

const getLightGroupOfRoom = R.pipe(
    R.view(Routes.inputNameLens),
    Rooms.getRoomOfDevice,
    R.flip(Groups.roomGroupOfType)("light"),
    R.keys,
    R.head,
);

const illuminanceBasedBrightness = R.pipe(
    R.view(Routes.inputDataLens),
    R.propOr(0,"illuminance"),
    R.ifElse(
        x => x < 20,
        R.always(255),
        R.always(0)
    ),
);

const dayPeriodBasedBrightness = R.ifElse(
    R.always(nightTime()),
    R.always(1),
    R.always(255)
);

const combinedBrightness = R.pipe(
    illuminanceBasedBrightness,
    R.min(dayPeriodBasedBrightness())
);

const getAdaptiveBrightness =  R.ifElse(
        isMessagefromRoomWithNightLight,
        combinedBrightness,
        illuminanceBasedBrightness
    );

// R.min(illuminanceBasedBrightness, dayPeriodBasedBrightness),
//     R.always(illuminanceBasedBrightness)

const setBrightnessInRoom = (input) => {
    return timedLightOnStream(90)(getAdaptiveBrightness(input))(getLightGroupOfRoom(input))
};

// To be expanded for multiple interfaces
// Zigbee.createGroups(
//     R.mergeAll([
//         Groups.roomGroupOfType("staircase", "light"), // to be created by automations
//         Groups.knownGroups,
//     ])
// );


const motionLight = Routes.input
    .filter(isMessageFromMotionSensor)
    .filter(isMessagefromRoomWithMotionLight)
    .filter(movementDetected)
    .flatMapLatest(setBrightnessInRoom);

Routes.output.plug(motionLight);

module.exports = {
    setBrightnessForDevice,
    setBrightnessInRoom,
    isMessageFromMotionSensor,
    isMessagefromRoomWithMotionLight,
    movementDetected,
    motionLight,
};

