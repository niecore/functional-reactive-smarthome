const R = require("ramda");
const Devices = require("../model/devices");

const deviceIsWindowContact = R.allPass([Devices.deviceHasSubType("window"), Devices.deviceHasType("contact")]);

// filterStateByWindows :: State => State
const filterStateByWindows = R.pickBy((k, v) => deviceIsWindowContact(v));

const windowIsOpen = R.pipe(
    R.propOr(true, "contact"),
    R.not
);

// allLightsOff :: State => boolean
const isAtLeastOneWindowOpenOfState = R.pipe(
    R.map(windowIsOpen),
    R.values,
    R.reduce(R.or, false),
);

const windowState = filterStateByWindows;

const anyWindowsOpen = R.pipe(
    windowState,
    isAtLeastOneWindowOpenOfState
);

module.exports = {
    anyWindowsOpen,
};
