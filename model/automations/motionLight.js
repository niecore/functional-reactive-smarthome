const R = require("ramda");
const Kefir = require("kefir");

const Lights = require("../service/lights");

const input = new Kefir.pool();

// isRoomWithMotionLight :: Msg => Boolean
const isRoomWithMotionLight = R.pipe(
    R.prop("room"),
    R.includes(R.__, R.keys(Automations.automations.motionLight.rooms))
);

const isPresenceInRoomEvent = R.propEq("id", "PresenceDetected");
const isNoPresenceInRoomEvent = R.propEq("id", "PresenceGone");
const isActivateSceneEvent = R.propEq("id", "ActivateScene");

const isRoomBrightEnough= R.propEq("id", "RoomBrightEnough");
const isRoomToDark = R.propEq("id", "RoomToDark");

const createNoActionEvent = () => ({id: "NoAction"});
const createTurnAllLightsInRoomOnEvent = room => ({id: "TurnLightsOn", room: room});
const createTurnAllLightsInRoomOffEvent = room => ({id: "TurnAllLightsOff", room: room});

const presenceStream = input
    .filter(isPresenceInRoomEvent);

const noPresenceStream = input
    .filter(isNoPresenceInRoomEvent);

const sceneStream = input
    .filter(isActivateSceneEvent);

const luminosityStream = input
    .filter(R.any([isRoomBrightEnough, isRoomToDark]));

const roomLuminosityProperty = room => luminosityStream
    .filter(R.propEq("room", room))
    .toProperty();

const presenceInRoomsWithMotionLight = presenceStream
    .filter(isRoomWithMotionLight);

// isRoomTooDark :: PresenceDetected => boolean
const isRoomTooDark = presenceDetected => isRoomToDark(roomLuminosityProperty(presenceDetected.room));

// isRoomTooDark :: PresenceDetected => boolean
const hasRoomAllLightsOff = presenceDetected => Lights.lightsInRoomOff(presenceDetected.room);

const output = presenceInRoomsWithMotionLight
    .filter(isRoomTooDark)
    .filter(hasRoomAllLightsOff)
    .flatMap(StartMotionLightRoutine);

const StartMotionLightRoutine = presenceDetected => {

    const room = presenceDetected.room;

    const TurnMotionLightsOn = Kefir.constant(createTurnAllLightsInRoomOnEvent(room));

    const WhenInterrupted = sceneStream
        .map(_ => createNoActionEvent());

    const WhenPresenceGone = noPresenceStream
        .map(_ => createTurnAllLightsInRoomOffEvent(room));

    return Kefir.merge(
        [
            TurnMotionLightsOn,
            WhenInterrupted,
            WhenPresenceGone
        ]
    ).take(2)
};


module.exports = {
    input,
    output
};
