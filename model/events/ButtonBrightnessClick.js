const R = require("ramda");
const Kefir = require("kefir");

const Devices = require("../devices");
const Lenses = require('../lenses');
const Remotes = require("../remotes");

// createButtonBrightnessUpClick :: Msg => ButtonBrightnessUpClick
const createButtonBrightnessUpClick = remote => {
    return ({id: "ButtonBrightnessUpClick", remote: remote});
};

// createButtonBrightnessUpClick :: remote => ButtonBrightnessDownClick
const createButtonBrightnessDownClick = remote => {
    return ({id: "ButtonBrightnessDownClick", remote: remote});
};

// createButtonBrightnessModificationEvent :: Msg => Either[ButtonBrightnessUpClick, ButtonBrightnessDownClick]
const createButtonBrightnessModificationEvent = msg => {
    const action = Remotes.getRemoteAction(msg);
    const remote = R.view(Lenses.inputNameLens)(msg);

    const buttonBrightnessUpClick = createButtonBrightnessUpClick(remote);
    const buttonBrightnessDownClick = createButtonBrightnessDownClick(remote);

    return action === "brightness_up_click" ? buttonBrightnessUpClick : buttonBrightnessDownClick
};


const remote = R.view(Lenses.inputNameLens);

// isMessageFromRemote :: Msg => Boolean
const isMessageFromRemote = R.pipe(
    R.view(Lenses.inputNameLens),
    Devices.deviceHasType("remote")
);

// isMessageWithBrightnessAdjustment :: Msg => Boolean
const isMessageABrightnessUpClick= R.pipe(
    Remotes.getRemoteAction,
    R.includes(R.__, ["brightness_up_click", "brightness_down_click"])
);

const input = new Kefir.pool();

const output = input
    .filter(isMessageFromRemote)
    .filter(isMessageABrightnessUpClick)
    .map(createButtonBrightnessModificationEvent);

module.exports = {
    input,
    output
};


