const R = require("ramda");
const Bacon = require("baconjs");
const Presence = require('../model/presence');
const Light = require('../model/light');
const Hub = require('../hub');
const Automations = require("../config/automations");

// isMessageFromRoomWithMotionLight :: Msg => Boolean
const isPresenceFromRoomWithMotionLight = R.pipe(
    Presence.getRoomOfPresence,
    R.includes(R.__, R.keys(Automations.automations.motionLight.rooms))
);

const motionLight = Hub.input
    .filter(Presence.isMessageFromPresence)
    .filter(isPresenceFromRoomWithMotionLight)
    .groupBy(Presence.getRoomOfPresence)
    .flatMap(function(groupedStream) {
        return groupedStream.flatMapLatest(Light.setAdaptiveBrightnessInRoom)
    });

module.exports = {
    motionLight
};
