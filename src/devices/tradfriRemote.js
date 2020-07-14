const R = require("ramda");
const Kefir = require("kefir");

const Devices = require("../model/devices");
const Lenses = require('../lenses');
const Events = require("../events/events");
const Rooms = require("../model/rooms");

// createButtonEvent :: id => room => Event
const createButtonEvent = id => room => Events.createEvent({room: room}, id);

// createBrightnessUpClick :: room => BrightnessUpClick
const createBrightnessUpClick = room => createButtonEvent("BrightnessUpClick")(room);

// createBrightnessDownClick :: room => BrightnessDownClick
const createBrightnessDownClick = room => createButtonEvent("BrightnessDownClick")(room);

// createToggleClick :: room => ToggleClick
const createToggleClick = room => createButtonEvent("ToggleClick")(room);

// createButtonPreviousClick :: room => PreviousSceneClick
const createButtonPreviousClick = room => createButtonEvent("PreviousSceneClick")(room);

// createNextSceneClick :: room => NextSceneClick
const createNextSceneClick = room => createButtonEvent("NextSceneClick")(room);

// createMoveBrightnessUp :: room => MoveBrightnessUp
const createMoveBrightnessUp = room => createButtonEvent("MoveBrightnessUp")(room);

// createMoveBrightnessDown :: room => MoveBrightnessDown
const createMoveBrightnessDown = room => createButtonEvent("MoveBrightnessDown")(room);

// createMoveBrightnessStop :: room => MoveBrightnessStop
const createMoveBrightnessStop = room => createButtonEvent("MoveBrightnessStop")(room);

// isMessageFromTradfriRemote :: Msg => Boolean
const isMessageFromTradfriRemote = R.pipe(
    R.view(Lenses.inputNameLens),
    Devices.deviceHasType("tradfri_remote")
);

// isMessageWithAction :: Msg => Boolean
const isMessageWithAction = R.pipe(
    R.view(Lenses.inputDataLens),
    R.has("action")
);

// createButtonBrightnessModificationEvent :: Msg => Either[PreviousSceneClick, BrightnessDownClick, ToggleClick, PreviousSceneClick, NextSceneClick]
const createTradfriButtonEvent = msg => {
    const action = R.prop("action")(R.view(Lenses.inputDataLens)(msg));
    const remote = R.view(Lenses.inputNameLens)(msg);
    const room = Rooms.getRoomOfDevice(remote);

    switch (action) {
        case "brightness_up_click":
            return createBrightnessUpClick(room)(msg);
        case "brightness_down_click":
            return createBrightnessDownClick(room)(msg);
        case "toggle":
            return createToggleClick(room)(msg);
        case "arrow_left_click":
            return createButtonPreviousClick(room)(msg);
        case "arrow_right_click":
            return createNextSceneClick(room)(msg);
        case 'brightness_up_hold':
            return createMoveBrightnessUp(room)(msg);
        case 'brightness_down_hold':
            return createMoveBrightnessDown(room)(msg);
        case 'brightness_up_release':
        case 'brightness_down_release':
            return createMoveBrightnessStop(room)(msg);
    }
};

const input = new Kefir.pool();

const output = input
    .filter(isMessageFromTradfriRemote)
    .filter(isMessageWithAction)
    .map(createTradfriButtonEvent);

module.exports = {
    input,
    output
};


