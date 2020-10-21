const R = require("ramda");
const Kefir = require("kefir");
const Events = require("../events/events");
const Rooms = require("../model/rooms");
const Lenses = require("../lenses");

const input = new Kefir.pool();

const windowHasBeenOpened = Events.isEvent("WindowOpened");
const windowHasBeenClosed = Events.isEvent("WindowClosed");
const doorHasBeenOpened = Events.isEvent("DoorOpened");
const doorHasBeenClosed = Events.isEvent("DoorClosed");

const windowOrDoorHasBeenOpened = R.anyPass([windowHasBeenOpened, doorHasBeenOpened]);
const windowOrDoorHasBeenClosed = R.anyPass([windowHasBeenClosed, doorHasBeenClosed]);

const createEventFromEventWithRoom = id => inputEvent => {
    const room = Rooms.getRoomOfDevice(inputEvent.device);
    return Events.createEvent({room}, id, inputEvent.state);
};

const enableHeatReductionInRoom = createEventFromEventWithRoom("EnableHeatReductionInRoom");
const disableHeatReductionInRoom = createEventFromEventWithRoom("DisableHeatReductionInRoom");

const opening = input
    .filter(windowOrDoorHasBeenOpened)
    .map(enableHeatReductionInRoom);

const closing = input
    .filter(windowOrDoorHasBeenClosed)
    .map(disableHeatReductionInRoom);

const output = opening.merge(closing);

module.exports = {
    input,
    output
};
