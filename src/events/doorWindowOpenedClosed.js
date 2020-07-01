const R = require("ramda");
const Kefir = require("kefir");

const Devices = require("../model/devices");
const Lenses = require('../lenses');
const Events = require("./events");

// contactLens :: Lens
const contactLens = R.compose(Lenses.inputDataLens, R.lensPath(["contact"]));

// opened :: Msg => Boolean
const closed = R.view(contactLens);

// opened :: Msg => Boolean
const opened = R.complement(closed);

const isContactSensor = R.pipe(
    R.view(Lenses.inputNameLens),
    Devices.deviceHasType("contact")
);

const isDoorSensor = R.pipe(
    R.view(Lenses.inputNameLens),
    Devices.deviceHasSubType("door")
);

const isWindowSensor = R.pipe(
    R.view(Lenses.inputNameLens),
    Devices.deviceHasSubType("window")
);

const isMessageFromDoorContact = R.allPass([isContactSensor, isDoorSensor]);
const isMessageFromWindowContact = R.allPass([isContactSensor, isWindowSensor]);

const createEventWithDeviceAndIdFromMsg = id => msg => Events.createEvent({device: R.view(Lenses.inputNameLens)(msg)}, id)(msg);

// createWindowOpened :: String => WindowOpened
const createWindowOpenedEvent = createEventWithDeviceAndIdFromMsg("WindowOpened");

// createWindowClosed :: String => WindowClosed
const createWindowClosedEvent = createEventWithDeviceAndIdFromMsg("WindowClosed");

// createDoorOpened :: String => DoorOpened
const createDoorOpenedEvent = createEventWithDeviceAndIdFromMsg("DoorOpened");

// createDoorClosed :: String => DoorClosed
const createDoorClosedEvent = createEventWithDeviceAndIdFromMsg("DoorClosed");

const input = new Kefir.pool();

const doorContactStream = input
    .filter(isMessageFromDoorContact);

const windowContactStream = input
    .filter(isMessageFromWindowContact);

const windowOpenedStream = windowContactStream
    .filter(opened)
    .map(createWindowOpenedEvent);

const windowClosedStream = windowContactStream
    .filter(closed)
    .map(createWindowClosedEvent);

const doorOpenedStream = doorContactStream
    .filter(opened)
    .map(createDoorOpenedEvent);

const doorClosedStream = doorContactStream
    .filter(closed)
    .map(createDoorClosedEvent);

const output = Kefir.merge([
    windowOpenedStream,
    windowClosedStream,
    doorOpenedStream,
    doorClosedStream
]);

module.exports = {
    input,
    output
};


