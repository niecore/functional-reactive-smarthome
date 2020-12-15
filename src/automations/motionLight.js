const R = require("ramda");
const Kefir = require("kefir");

const Automations = require("../../config/automations.json");
const Lights = require("../service/lights");
const Luminosity = require("../service/luminosity");
const DayPeriod = require("../model/dayPeriod");
const Scenes = require("../model/scenes");
const Events = require("../events/events");
const Lenses = require("../lenses");

const input = new Kefir.pool();

// isRoomWithMotionLight :: Msg => Boolean
const isRoomWithMotionLight = R.pipe(
    R.prop("room"),
    R.includes(R.__, R.keys(Automations.automations.motionLight.rooms))
);

const isPresenceInRoomEvent = Events.isEvent("PresenceDetected");
const isNoPresenceInRoomEvent = Events.isEvent("PresenceGone");
const isActivateSceneEvent = Events.isEvent("StartScene");

const createNoActionEvent = Events.createBasicEvent("NoAction");
const createTurnAllLightsInRoomOnEvent = room => Events.createEvent({room: room}, "TurnLightsOn");
const createTurnAllNightLightsInRoomOnEvent = room => Events.createEvent({room: room}, "TurnNightLightsOn");
const createTurnAllLightsInRoomOffEvent = room => Events.createEvent({room: room}, "TurnLightsOff");

const presenceStream = input
    .filter(isPresenceInRoomEvent);

const noPresenceStream = input
    .filter(isNoPresenceInRoomEvent);

const sceneStream = input
    .filter(isActivateSceneEvent)
    .map(Scenes.getSceneFromEvent);

const presenceInRoomsWithMotionLight = presenceStream
    .filter(isRoomWithMotionLight);

// isRoomTooDark :: PresenceDetected => boolean
const isRoomTooDark = presenceDetected => Luminosity.isRoomToDark(presenceDetected.room)(R.view(Lenses.stateLens, presenceDetected.state));

// isRoomTooDark :: PresenceDetected => boolean
const hasRoomAllLightsOff = presenceDetected => Lights.lightsInRoomOff(presenceDetected.room)(R.view(Lenses.stateLens, presenceDetected.state));

// isRoomWithNightlight :: String => boolean
const isRoomWithNightlight = R.pipe(
    R.prop(R.__, Automations.automations.motionLight.rooms),
    R.propOr(true, "nightLight")
);

// useNightLight :: String => boolean
const useNightLight = room => DayPeriod.itsNightTime() && isRoomWithNightlight(room);

const presenceGoneInRoom = room => R.propEq("room", room);

// startMotionLightRoutine :: PresenceDetected => Stream<TurnLightsOn, TurnLightsOff, NoAction>
const startMotionLightRoutine = presenceDetected => {
    const state = Events.getState(presenceDetected);
    const room = presenceDetected.room;

    const TurnMotionLightsOn = useNightLight(room)
        ? createTurnAllNightLightsInRoomOnEvent(room)(state)
        : createTurnAllLightsInRoomOnEvent(room)(state);

    const WhenInterrupted = sceneStream
        .filter(Scenes.isSceneInRoom(room))
        .map(_ => createNoActionEvent(state));

    const WhenPresenceGone = noPresenceStream
        .filter(presenceGoneInRoom(room))
        .map(_ => createTurnAllLightsInRoomOffEvent(room)(state));

    return Kefir.merge(
        [
            Kefir.constant(TurnMotionLightsOn),
            WhenInterrupted,
            WhenPresenceGone
        ]
    ).take(2)
};

const output = presenceInRoomsWithMotionLight
    .filter(hasRoomAllLightsOff)
    .filter(isRoomTooDark)
    .flatMap(startMotionLightRoutine);

module.exports = {
    input,
    output
};
