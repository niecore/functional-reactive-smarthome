const R = require("ramda");
const Kefir = require("kefir");

const Devices = require("../model/devices");
const Lenses = require('../lenses');
const Events = require("../events/events");

// createButtonBrightnessUpClick :: remote => ButtonBrightnessUpClick
const createButtonBrightnessUpClick = remote => Events.createEvent({remote: remote}, "ButtonBrightnessUpClick");

// createButtonBrightnessDownClick :: remote => ButtonBrightnessDownClick
const createButtonBrightnessDownClick = remote => Events.createEvent({remote: remote}, "ButtonBrightnessDownClick");

// createButtonToggleClick :: remote => ButtonToggleClick
const createButtonToggleClick = remote => Events.createEvent({remote: remote}, "ButtonToggleClick");

// createButtonPreviousClick :: remote => ButtonPreviousSceneClick
const createButtonPreviousClick = remote => Events.createEvent({remote: remote}, "ButtonPreviousSceneClick");

// createButtonNextSceneClick :: remote => ButtonNextSceneClick
const createButtonNextSceneClick = remote => Events.createEvent({remote: remote}, "ButtonNextSceneClick");

// isMessageFromTradfriRemote :: Msg => Boolean
const isMessageFromTradfriRemote = R.pipe(
    R.view(Lenses.inputNameLens),
    Devices.deviceHasType("tradfri_remote")
);

// createButtonBrightnessModificationEvent :: Msg => Either[ButtonBrightnessUpClick, ButtonBrightnessDownClick, ButtonToggleClick, ButtonPreviousSceneClick, ButtonNextSceneClick]
const createTradfriButtonEvent = msg => {
    const action = R.prop("action")(R.view(Lenses.inputDataLens)(msg));
    const remote = R.view(Lenses.inputNameLens)(msg);

    switch (action) {
        case "brightness_up_click":
            return createButtonBrightnessUpClick(remote)(msg);
        case "brightness_down_click":
            return createButtonBrightnessDownClick(remote)(msg);
        case "toggle":
            return createButtonToggleClick(remote)(msg);
        case "arrow_left_click":
            return createButtonPreviousClick(remote)(msg);
        case "arrow_right_click":
            return createButtonNextSceneClick(remote)(msg);
    }
};

const input = new Kefir.pool();

const output = input
    .filter(isMessageFromTradfriRemote)
    .map(createTradfriButtonEvent);

module.exports = {
    input,
    output
};


