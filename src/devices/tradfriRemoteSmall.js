const R = require("ramda");
const Kefir = require("kefir");

const Devices = require("../model/devices");
const Lenses = require('../lenses');
const Events = require("../events/events");

// createButtonOffClick :: remote => ButtonOffClick
const createButtonOffClick = remote => Events.createEvent({remote: remote}, "ButtonOffClick");

// createButtonOnClick :: remote => ButtonOnClick
const createButtonOnClick = remote => Events.createEvent({remote: remote}, "ButtonOnClick");

// isMessageFromTradfriRemote :: Msg => Boolean
const isMessageFromTradfriRemote = R.pipe(
    R.view(Lenses.inputNameLens),
    Devices.deviceHasType("tradfri_remote_small")
);

// isMessageWithAction :: Msg => Boolean
const isMessageWithAction = R.pipe(
    R.view(Lenses.inputDataLens),
    R.has("action")
);

// createTradfriButtonEvent :: Msg => Either[ButtonOfClick, ButtonOnClick]
const createTradfriButtonEvent = msg => {
    const action = R.prop("action")(R.view(Lenses.inputDataLens)(msg));
    const remote = R.view(Lenses.inputNameLens)(msg);

    switch (action) {
        case "off":
            return createButtonOffClick(remote)(msg);
        case "on":
            return createButtonOnClick(remote)(msg);
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


