const R = require("ramda");
const Kefir = require("kefir");

const Rooms = require("../model/rooms");

const input = new Kefir.pool();

const isBrightnessDownClick = R.propEq("id", "ButtonBrightnessDownClick");
const isBrightnessUpClick = R.propEq("id", "ButtonBrightnessUpClick");

// createChangeBrightnessEvent :: remote => ButtonBrightnessDownClick
const createChangeBrightnessEvent = room => brightness => {
    return ({id: "ChangeBrightness", room: room, brightness: brightness});
};

// changeBrightness :: Either<ButtonBrightnessDownClick, ButtonBrightnessUpClick> => Stream<TurnLightOn, ChangeBrightness>
const changeBrightness = brightnessControlClick => {
    const room = Rooms.getRoomOfDevice(brightnessControlClick.remote);
    const factor = isBrightnessUpClick(brightnessControlClick) ? 50 : -50;

    return createChangeBrightnessEvent(room)(factor);
};

const output = input
    .filter(R.anyPass([isBrightnessUpClick, isBrightnessDownClick]))
    .map(changeBrightness);

module.exports = {
    input,
    output
};
