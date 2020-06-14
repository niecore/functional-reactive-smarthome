const R = require("ramda");
const Kefir = require("kefir");

const Automations = require("../../config/automations");
const Lights = require("../service/lights");
const Luminosity = require("../service/luminosity");
const DayPeriod = require("../model/dayPeriod");

const input = new Kefir.pool();

// isRoomWithMotionLight :: Msg => Boolean
const isRoomWithMotionLight = R.pipe(
    R.prop("room"),
    R.includes(R.__, R.keys(Automations.automations.motionLight.rooms))
);

const isPresenceInRoomEvent = R.propEq("id", "PresenceDetected");
const isNoPresenceInRoomEvent = R.propEq("id", "PresenceGone");
const isActivateSceneEvent = R.propEq("id", "ActivateScene");

const createNoActionEvent = () => ({id: "NoAction"});
const createTurnAllLightsInRoomOnEvent = room => ({id: "TurnLightsOn", room: room});
const createTurnAllNightLightsInRoomOnEvent = room => ({id: "TurnNightLightsOn", room: room});
const createTurnAllLightsInRoomOffEvent = room => ({id: "TurnAllLightsOff", room: room});

const presenceStream = input
    .filter(isPresenceInRoomEvent);

const noPresenceStream = input
    .filter(isNoPresenceInRoomEvent);

const sceneStream = input
    .filter(isActivateSceneEvent);

const presenceInRoomsWithMotionLight = presenceStream
    .filter(isRoomWithMotionLight);

// isRoomTooDark :: PresenceDetected => boolean
const isRoomTooDark = presenceDetected => Luminosity.isRoomToDark(presenceDetected.room);

// isRoomTooDark :: PresenceDetected => boolean
const hasRoomAllLightsOff = presenceDetected => Lights.lightsInRoomOff(presenceDetected.room);

// isRoomWithNightlight :: String => boolean
const isRoomWithNightlight = R.pipe(
    R.prop(R.__, Automations.automations.motionLight.rooms),
    R.propOr(true, "nightLight")
);

// useNightLight :: String => boolean
const useNightLight = room => DayPeriod.itsNightTime() && isRoomWithNightlight(room);

// startMotionLightRoutine :: PresenceDetected => Stream<TurnLightsOn, TurnAllLightsOff, NoAction>
const startMotionLightRoutine = presenceDetected => {

    const room = presenceDetected.room;

    const TurnMotionLightsOn = useNightLight(room)
        ? createTurnAllNightLightsInRoomOnEvent(room)
        : createTurnAllLightsInRoomOnEvent(room);

    const WhenInterrupted = sceneStream
        .map(_ => createNoActionEvent());

    const WhenPresenceGone = noPresenceStream
        .map(_ => createTurnAllLightsInRoomOffEvent(room));

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
