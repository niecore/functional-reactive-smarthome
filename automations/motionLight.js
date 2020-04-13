const R = require("ramda");
const Kefir = require("kefir");
const Presence = require('../model/presence');
const Light = require('../model/light');
const Scenes = require('../model/scenes');
const Lenses = require('../lenses');
const Automations = require("../config/automations.json");

// isMessageFromRoomWithMotionLight :: Msg => Boolean
const isPresenceFromRoomWithMotionLight = R.pipe(
    Presence.getRoomOfPresence,
    R.includes(R.__, R.keys(Automations.automations.motionLight.rooms))
);

const input = new Kefir.pool();

let currentMotionLightSettingInRoom = {};

const output = input
    .filter(Presence.isMessageFromPresence)
    .filter(isPresenceFromRoomWithMotionLight)
    .map(
        x => Presence.isMessageWithPresenceOn(x)
            ? turnOnWithState(x)
            : motionLightInRoomActive(x)
                ? turnOffIfNotChanged(x)
                : {}
    );

const motionLightInRoomActive = x => {
    return !R.propEq(Presence.getRoomOfPresence(x), {}, currentMotionLightSettingInRoom);
};


const turnOnWithState = x => {
    const room = Presence.getRoomOfPresence(x);
    const output = Light.setLightInRoomAdaptiveOn(x);

    const currentStateOfLightsThatAreEffectedByMotionLight = R.mapObjIndexed((num, key, obj) => {
        return R.mergeLeft(
            num,
            R.pipe(
                R.view(Lenses.stateLens),
                R.propOr({}, key),
                R.pick(["state", "brightness", "color", "color_temp"])
            )(x)
        )
    })(output);


    currentMotionLightSettingInRoom = R.assoc(room, currentStateOfLightsThatAreEffectedByMotionLight, currentMotionLightSettingInRoom);

    return output
};

const lightHasChangedInRoom = x => {
    const room = Presence.getRoomOfPresence(x);
    return !Scenes.sceneIsActive(R.view(Lenses.stateLens, x))(R.prop(room, currentMotionLightSettingInRoom))
};

const turnOffIfNotChanged = x => {
    if (!lightHasChangedInRoom(x)) {
        return Light.setLightInRoomOff(x)
    } else {
        return {}
    }
};

module.exports = {
    input,
    output
};
