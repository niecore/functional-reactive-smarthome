const R = require("ramda");
const Kefir = require("kefir");

const Rooms = require("../model/rooms");
const Devices = require("../model/devices");
const Lights = require("../service/lights");
const Events = require("./events");
const Lenses = require("../lenses");

const isMoveBrightnessUpEvent = Events.isEvent("MoveBrightnessUp");
const isMoveBrightnessDownEvent = Events.isEvent("MoveBrightnessDown");
const isMoveBrightnessStopEvent = Events.isEvent("MoveBrightnessStop");

const input = new Kefir.pool();

// hasMoveFunction :: String => boolean
const hasMoveFunction = Devices.hasFunction("brightness_move");

const stepSize = 15;
const delay = 200;
const maxSteps = 17;

// getBrightnessOfLight :: Event => String => boolean
const getBrightnessOfLight = event => light => Lights.getBrightnessOfLight(light)(R.view(Lenses.stateLens, event.state));

const moveStopStream = input
    .filter(isMoveBrightnessStopEvent);

const output = input
    .filter(R.anyPass([isMoveBrightnessUpEvent, isMoveBrightnessDownEvent]))
    .flatMap(moveBrightnessEvent => {

        const isBrightnessUpEvent = Events.isEvent("MoveBrightnessUp")(moveBrightnessEvent);

        const moveStopInRoomStream = moveStopStream
            .filter(R.propEq("room", moveBrightnessEvent.room));

        const dimmableLightsInRoom = Rooms.getDevicesInRoom(moveBrightnessEvent.room)
            .filter(Devices.isLight)
            .filter(Devices.hasFunction("brightness"));

        // NON MOVE LIGHTS
        const dimmableLightsWithoutMoveFunction = dimmableLightsInRoom
            .filter(R.complement(hasMoveFunction));

        const brightnessOfLights = dimmableLightsWithoutMoveFunction
            .map(getBrightnessOfLight(moveBrightnessEvent))
            .map(x => ({brightness: x}));

        const currentBrightnessOfLights = R.zipObj(dimmableLightsWithoutMoveFunction, brightnessOfLights);

        //  HELP
        let i;
        const spreadArray = R.repeat(currentBrightnessOfLights, maxSteps);
        for (i = 0; i < spreadArray.length; i++) {
            const modifcator = isBrightnessUpEvent ? stepSize : -stepSize;
            spreadArray[i] = R.map(x => R.assoc("brightness", R.clamp(1, 255, x.brightness + ((i + 1) * modifcator)), x))(spreadArray[i])
        }
        //  HELP

        const moveStopInRoomForNonMoveLights = moveStopInRoomStream
            .map(R.F)
            .merge(Kefir.constant(true));

        const brightnessStreamForLightsWithoutMoveBrightness = Kefir.sequentially(delay, spreadArray).filterBy(moveStopInRoomForNonMoveLights);

        // MOVE LIGHTS
        const dimmableLightsWithMoveFunction = dimmableLightsInRoom
            .filter(hasMoveFunction);

        const brightnessMoveCommand = dimmableLightsWithMoveFunction
            .map(_ => ({"brightness_move": isBrightnessUpEvent ? 75 : -75}));

        const brightnessMoveStopCommand = dimmableLightsWithMoveFunction
            .map(_ => ({"brightness_move": "stop"}));

        const startMoveCommandStream = Kefir.constant(R.zipObj(dimmableLightsWithMoveFunction, brightnessMoveCommand));

        const brightnessMoveStopCommandStream = moveStopInRoomStream
            .map(_ => R.zipObj(dimmableLightsWithMoveFunction, brightnessMoveStopCommand));

        const brightnessStreamForLightsWithMoveBrightness = startMoveCommandStream.merge(brightnessMoveStopCommandStream);

        return brightnessStreamForLightsWithoutMoveBrightness.merge(brightnessStreamForLightsWithMoveBrightness);
    });

module.exports = {
    input,
    output
};


