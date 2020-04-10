const R = require("ramda");
const Kefir = require("kefir");
const Groups = require("../model/groups");
const Devices = require("../model/devices");
const Logic = require("../model/logic");
const Lenses = require('../lenses');
const DayPeriod = require('../model/day_period');
const Automations = require('../config/automations.json');

// turnLightOnWithBrightness :: Number => String => String
const turnLightOnWithBrightness = level => device => R.objOf(device, {
    state: "ON",
    brightness: level
});

const getAdaptiveBrightness = input => {
    if(DayPeriod.itsNightTime() && isMessageFromRoomWithNightLight(input)){
        return 1;
    }else {
        return 255;
    }
};

const getLightsInRoom = R.pipe(
    Logic.getDevicesInSameRoom,
    R.filter(Devices.deviceHasType("light"))
);

const getNightLightsInRoom = R.pipe(
    getLightsInRoom,
    R.filter(
        R.pipe(
            Devices.getDeviceByName,
            R.propEq("sub_type", "indirect")
        )
    )
);




// getLightGroup :: Msg => String
const getLightGroup = msg => {
    if(DayPeriod.itsNightTime() && isMessageFromRoomWithNightLight(msg)){
        return getNightLightsInRoom(msg);
    }else {
        return getLightsInRoom(msg);
    }
};

// isMessageFromRoomWithNightLight :: Msg => Boolean
const isMessageFromRoomWithNightLight = R.pipe(
    Logic.getRoomOfMessage,
    R.prop(R.__, Automations.automations.motionLight.rooms),
    R.propOr(false, "nightLight")
);

// isMessageFromRoomWithLightOff :: Msg => Boolean
const isMessageFromRoomWithLightOff = R.pipe(
    Logic.getStateOfDeviceInSameRoom,
    R.pickBy((k, v) => Devices.deviceHasType("light")(v)),
    R.map(R.prop("state")),
    R.map(state => state.toLowerCase() !== "off"),
    R.values,
    R.reduce(R.or, false),
    R.not,
);

// currentIlluminanceInRoom :: Msg => Number
const currentIlluminanceInRoom = R.pipe(
    Logic.getStateOfDeviceInSameRoom,
    R.pickBy((k, v) => Devices.deviceHasType("motion_sensor")(v)),
    R.map(R.prop("illuminance")),
    R.values,
    R.mean,
    R.defaultTo(0)
);

// roomToDark :: Msg => Boolean
const roomToDark = R.pipe(
    currentIlluminanceInRoom,
    R.gt(9)
);

const lightChangeRequired = R.allPass(
    [roomToDark, isMessageFromRoomWithLightOff]
);

const setLightInRoomAdaptiveOn = (input) => {
    if(lightChangeRequired(input)) {

        return R.pipe(
            turnLightOnWithBrightness( getAdaptiveBrightness(input))
        )(getLightGroup(input));
    }
    return {};
};

const setLightInRoomOff = R.pipe(
    getLightGroup,
    R.objOf(R.__, {
        state: "OFF",
    })
);


module.exports = {
    setLightInRoomAdaptiveOn,
    setLightInRoomOff,
    isMessageFromRoomWithLightOff
};
