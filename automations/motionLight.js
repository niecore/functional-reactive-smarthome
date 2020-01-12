const Automations = require('../config/automations.json');
const Routes = require('../router');
const Zigbee = require("../interfaces/zigbee");
const Groups = require("../model/groups");
const Devices = require("../model/devices");
const Rooms = require("../model/rooms");
const R = require("ramda");

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

const motionLight = R.pipe(
    R.filter(isMessageFromMotionSensor),
    R.filter(isMessagefromRoomWithMotionLight),
    R.filter(movementDetected),
);

//////////////////////////////////////////////
//
// Section has to be moved to light controller
//
//////////////////////////////////////////////

// setBrightnessForDevice :: String => String
const setBrightnessForDevice = brightnessTarget => device => R.objOf(device, setBrightness(brightnessTarget));

const setBrightness = brightnessTarget => {
    return {
        state: "on",
        brightness: brightnessTarget
    };
}


// To be expanded for multiple interfaces
Zigbee.createGroups(
    R.mergeAll([
        Groups.roomGroupOfType("staircase", "light"), // to be created by automations
        Groups.knownGroups,
    ])
);


console.log(

    motionLight(
        [{
            motionsensor_aqara_1: {
                occupancy: true
            }
        },{}]
    )
);

module.exports = {
    setBrightnessForDevice,
    isMessageFromMotionSensor,
    isMessagefromRoomWithMotionLight,
    movementDetected,
    motionLight,
};

