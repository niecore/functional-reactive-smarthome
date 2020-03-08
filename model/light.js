const R = require("ramda");
const Bacon = require("baconjs");
const Groups = require("../model/groups");
const Rooms = require("../model/rooms");
const Devices = require("../model/devices");
const Lenses = require('../lenses');
const DayPeriod = require('../model/day_period');
const Automations = require('../config/automations.json');

// turnLightOnWithBrightness :: Number => String => String
const turnLightOnWithBrightness = level => device => R.objOf(device, {
    state: "ON",
    brightness: level,
    transition: 1,
});

const turnLightOff = device => R.objOf(device, {
    state: "OFF",
});

const setAdaptiveBrightnessInRoom = (input) => {
    return timedLightOnStream(
        configuredMotionLightDuration(input)
    )(
        getAdaptiveBrightness(input)
    )(
        getLightGroup(input)
    )
};

const getAdaptiveBrightness = input => {
    if(roomToDark(input)){
        if(DayPeriod.itsNightTime() && isMessageFromRoomWithNightLight(input)){
            return 1;
        }else {
            return 255;
        }
    } else {
        if (isMessageFromRoomWithLightOff(input)) {
            return 0;
        } else {
            return currentBrightnessInRoom(input);
        }
    }
};

const timedLightOnStream = duration => brightness => device => Bacon.once(turnLightOnWithBrightness(brightness)(device)).merge(Bacon.later(duration * 1000, turnLightOff(device)));

// getLightGroupOfRoom :: Msg => String
const getLightGroupOfRoom = R.pipe(
    R.view(Lenses.inputNameLens),
    Rooms.getRoomOfDevice,
    Groups.roomTypeGroupName("light"),
);

// getNightLightGroupOfRoom :: Msg => String
const getNightLightGroupOfRoom = R.pipe(
    R.view(Lenses.inputNameLens),
    Rooms.getRoomOfDevice,
    Groups.roomTypeGroupName("nightlight"),
);

// getLightGroup :: Msg => String
const getLightGroup = msg => {
    if(DayPeriod.itsNightTime() && isMessageFromRoomWithNightLight(msg)){
        return getNightLightGroupOfRoom(msg);
    }else {
        return getLightGroupOfRoom(msg);
    }
};

// roomToDark :: Msg => Boolean
const roomToDark = R.pipe(
    R.view(Lenses.inputDataLens),
    R.propOr(0,"illuminance"),
    R.gt(9)
);

// isMessageFromRoomWithNightLight :: Msg => Boolean
const isMessageFromRoomWithNightLight = R.pipe(
    R.view(Lenses.inputNameLens),
    Rooms.getRoomOfDevice,
    R.prop(R.__, Automations.automations.motionLight.rooms),
    R.propOr(false, "nightLight")
);

// isMessageFromRoomWithLightOff :: Msg => Boolean
const isMessageFromRoomWithLightOff = R.pipe(
    Rooms.getStateOfDeviceInSameRoom,
    R.pickBy((k, v) => Devices.deviceHasType("light")(v)),
    R.map(R.prop("state")),
    R.map(state => state.toLowerCase() !== "off"),
    R.values,
    R.reduce(R.or, false),
    R.not,
);

// currentBrightnessInRoom :: Msg => Number
const currentBrightnessInRoom = R.pipe(
    Rooms.getStateOfDeviceInSameRoom,
    R.pickBy((k, v) => Devices.deviceHasType("light")(v)),
    R.map(R.prop("brightness")),
    R.values,
    R.head
);

// isMessageFromRoomWithNightLight :: Msg => Boolean
const configuredMotionLightDuration = R.pipe(
    R.view(Lenses.inputNameLens),
    Rooms.getRoomOfDevice,
    R.prop(R.__, Automations.automations.motionLight.rooms),
    R.propOr(90, "delay")
);


module.exports = {
    setAdaptiveBrightnessInRoom,
    isMessageFromRoomWithLightOff,
    currentBrightnessInRoom
};
