const R = require("ramda");
const Kefir = require("kefir");

const Rooms = require("../model/rooms");
const Events = require("../events/events");

const input = new Kefir.pool();

const isBrightnessDownClick = Events.isEvent("ButtonBrightnessDownClick");
const isBrightnessUpClick = Events.isEvent("ButtonBrightnessUpClick");

// createChangeBrightnessEvent :: remote => ButtonBrightnessDownClick
const createChangeBrightnessEvent = room => brightness => Events.createEvent({room: room, brightness: brightness}, "ChangeBrightness");

// changeBrightness :: Either<ButtonBrightnessDownClick, ButtonBrightnessUpClick> => Stream<TurnLightOn, ChangeBrightness>
const changeBrightness = brightnessControlClick => {
    const room = Rooms.getRoomOfDevice(brightnessControlClick.remote);
    const factor = isBrightnessUpClick(brightnessControlClick) ? 50 : -50;

    return createChangeBrightnessEvent(room)(factor)(Events.getState(brightnessControlClick));
};

const output = input
    .filter(R.anyPass([isBrightnessUpClick, isBrightnessDownClick]))
    .map(changeBrightness);

module.exports = {
    input,
    output
};
