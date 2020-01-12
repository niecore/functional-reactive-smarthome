const Automations = require('../config/automations.json');
const Zigbee = require("../interfaces/zigbee");
const Groups = require("../model/groups");
const Devices = require("../model/devices");
const Rooms = require("../model/rooms");
const R = require("ramda");
const Routes = require('../router');

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



//////////////////////////////////////////////
//
// Section has to be moved to light controller
//
//////////////////////////////////////////////


// setBrightnessForDevice :: Number => String =>String
const setBrightnessForDevice = brightnessTarget => device => R.objOf(device, setBrightness(brightnessTarget));

const setBrightness = brightnessTarget => {
    return {
        state: "on",
        brightness: brightnessTarget
    };
};


const setBrightnessInRoom = R.pipe(
    R.view(Routes.inputNameLens),
    Rooms.getRoomOfDevice,
    R.flip(Groups.roomGroupOfType)("light"),
    R.keys,
    R.head,
    setBrightnessForDevice(42),
);



// To be expanded for multiple interfaces
Zigbee.createGroups(
    R.mergeAll([
        Groups.roomGroupOfType("staircase", "light"), // to be created by automations
        Groups.knownGroups,
    ])
);


const motionLight = Routes.input
    .filter(isMessageFromMotionSensor)
    .filter(isMessagefromRoomWithMotionLight)
    .filter(movementDetected)
    .map(setBrightnessInRoom);

Routes.output.plug(motionLight);

module.exports = {
    setBrightnessForDevice,
    setBrightnessInRoom,
    isMessageFromMotionSensor,
    isMessagefromRoomWithMotionLight,
    movementDetected,
    motionLight,
};

