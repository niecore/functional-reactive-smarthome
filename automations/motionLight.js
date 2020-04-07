const R = require("ramda");
const Kefir = require("kefir");
const Presence = require('../model/presence');
const Light = require('../model/light');
const Automations = require("../config/automations.json");

// isMessageFromRoomWithMotionLight :: Msg => Boolean
const isPresenceFromRoomWithMotionLight = R.pipe(
    Presence.getRoomOfPresence,
    R.includes(R.__, R.keys(Automations.automations.motionLight.rooms))
);

const input = new Kefir.pool();

const output = input
    .filter(Presence.isMessageFromPresence)
    .filter(isPresenceFromRoomWithMotionLight)
    .map(
        x => Presence.isMessageWithPresenceOn(x)
            ? Light.setLightInRoomAdaptiveOn(x)
            : Light.setLightInRoomOff(x)
    );

module.exports = {
    input,
    output
};
