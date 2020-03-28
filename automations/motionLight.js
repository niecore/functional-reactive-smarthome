const R = require("ramda");
const Kefir = require("kefir");
const Presence = require('../model/presence');
const Light = require('../model/light');
const Util = require('../model/util');
const Automations = require("../config/automations");

// isMessageFromRoomWithMotionLight :: Msg => Boolean
const isPresenceFromRoomWithMotionLight = R.pipe(
    Presence.getRoomOfPresence,
    R.includes(R.__, R.keys(Automations.automations.motionLight.rooms))
);

const input = new Kefir.pool();

const output = input
    .filter(Presence.isMessageFromPresence)
    .filter(isPresenceFromRoomWithMotionLight)
    .thru(Util.groupBy(Presence.getRoomOfPresence))
    .flatMap(function(groupedStream) {
        return groupedStream.flatMapLatest(Light.setAdaptiveBrightnessInRoom)
    });

module.exports = {
    input,
    output
};
