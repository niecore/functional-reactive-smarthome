const R = require("ramda");
const Kefir = require("kefir");
const Presence = require('../model/presence');
const Light = require('../model/light');
const Scenes = require('../model/scenes');
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
            : turnOffIfNotChanged(x)
    );

const turnOnWithState = x => {
    const room = Presence.getRoomOfPresence(x);
    const output = Light.setLightInRoomAdaptiveOn(x);

    currentMotionLightSettingInRoom = R.assoc(room, output, currentMotionLightSettingInRoom);

    return output
};

const lightHasChangedInRoom = x => {
    const room = Presence.getRoomOfPresence(x);
    return !Scenes.sceneIsActive(x)(R.prop(room, currentMotionLightSettingInRoom))
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
