const Automations = require('../config/automations.json');
const Routes = require('../router');
const Zigbee = require("../interfaces/zigbee");
const Groups = require("../model/groups");
const Devices = require("../model/devices");
const Rooms = require("../model/rooms");
const R = require("ramda");


const occupancyLens = R.compose(Routes.inputDataLens, R.lensPath(["occupancy"]));

const movementDetected = R.map(R.view(occupancyLens));

const isMotionSensorMessage = R.pipe(
    R.view(Routes.inputNameLens),
    Devices.deviceHasType("motion_sensor")
);

const motionLightEnabledRoom = R.includes(R.__, R.keys(Automations.automations.motionLight.rooms));

const isMessageFromEnabledRoom = R.pipe(
    R.view(Routes.inputNameLens),
    Rooms.getRoomOfDevice,
    motionLightEnabledRoom
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
};


// To be expanded for multiple interfaces
Zigbee.createGroups(
    R.mergeAll([
        Groups.roomGroupOfType("staircase", "light"), // to be created by automations
        Groups.knownGroups,
    ])
);

module.exports = {
    setBrightnessForDevice,
};

