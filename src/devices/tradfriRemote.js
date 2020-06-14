const R = require("ramda");
const Kefir = require("kefir");

const Devices = require("../model/devices");
const Lenses = require('../lenses');

// createButtonBrightnessUpClick :: Msg => ButtonBrightnessUpClick
const createButtonBrightnessUpClick = remote => {
    return ({id: "ButtonBrightnessUpClick", remote: remote});
};

// createButtonBrightnessDownClick :: remote => ButtonBrightnessDownClick
const createButtonBrightnessDownClick = remote => {
    return ({id: "ButtonBrightnessDownClick", remote: remote});
};

// createButtonToggleClick :: remote => ButtonToggleClick
const createButtonToggleClick = remote => {
    return ({id: "ButtonToggleClick", remote: remote});
};

// createButtonPreviousClick :: remote => ButtonPreviousSceneClick
const createButtonPreviousClick = remote => {
    return ({id: "ButtonPreviousSceneClick", remote: remote});
};

// createButtonNextSceneClick :: remote => ButtonNextSceneClick
const createButtonNextSceneClick = remote => {
    return ({id: "ButtonNextSceneClick", remote: remote});
};

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
            return createButtonBrightnessUpClick(remote);
        case "brightness_down_click":
            return createButtonBrightnessDownClick(remote);
        case "toggle":
            return createButtonToggleClick(remote);
        case "arrow_left_click":
            return createButtonPreviousClick(remote);
        case "arrow_right_click":
            return createButtonNextSceneClick(remote);
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


