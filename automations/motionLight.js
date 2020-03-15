const R = require("ramda");
const Bacon = require("baconjs");
const Presence = require('../model/presence');
const Light = require('../model/light');
const Routes = require('../router');
const Automations = require("../config/automations");

// isMessageFromRoomWithMotionLight :: Msg => Boolean
const isPresenceFromRoomWithMotionLight = R.pipe(
    Presence.getRoomOfPresence,
    R.includes(R.__, R.keys(Automations.automations.motionLight.rooms))
);

const motionLight = Routes.input
    .filter(Presence.isMessageFromPresence)
    .groupBy(Presence.getRoomOfPresence)
    .flatMap(function(groupedStream) {
        return groupedStream.flatMapLatest(Light.setAdaptiveBrightnessInRoom)
    });

Routes.output.plug(motionLight);