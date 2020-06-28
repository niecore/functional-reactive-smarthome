const R = require("ramda");
const Kefir = require("kefir");

const Events = require("./events");
const Util = require('../util');

// isMovementDetectedEvent :: Event => boolean
const isMovementDetectedEvent = Events.isEvent("MovementDetected");

// getRoomOfMovement :: MovementDetectedEvent => String
const getRoomOfMovement = R.prop("room");

// createPresenceDetectedEvent :: String => PresenceDetectedEvent
const createPresenceDetectedEvent = room => Events.createEvent({room: room}, "PresenceDetected");

// createPresenceGoneEvent :: String => PresenceGoneEvent
const createPresenceGoneEvent = room => Events.createEvent({room: room}, "PresenceGone");

// presenceDetectedDueToMovementInRoom :: MovementDetectedEvent => Stream<PresenceDetectedEvent | PresenceGoneEvent>
const presenceDetectedDueToMovementInRoom = movementDetectedEvent => {
    const room = getRoomOfMovement(movementDetectedEvent);
    const state = Events.getState(movementDetectedEvent);

    const presenceDetected = Kefir.constant(createPresenceDetectedEvent(room)(state));
    const presenceGone = Kefir.later(120000, createPresenceGoneEvent(room)(state));

    return presenceDetected.merge(presenceGone)
};

const input = new Kefir.pool();

const output = input
    .filter(isMovementDetectedEvent)
    .thru(Util.groupBy(getRoomOfMovement))
    .flatMap( groupedStream => {
        return groupedStream
            .flatMapLatest(presenceDetectedDueToMovementInRoom)
            .skipDuplicates((a, b) => a.room === b.room);
    });

module.exports = {
    input,
    output
};


