const R = require("ramda");
const Kefir = require("kefir");

const Util = require('../util');


// isMovementDetectedEvent :: Event => boolean
const isMovementDetectedEvent = R.propEq("id", "MovementDetected");

// getRoomOfMovement :: MovementDetectedEvent => String
const getRoomOfMovement = R.prop("room");

// createPresenceDetectedEvent :: String => PresenceDetectedEvent
const createPresenceDetectedEvent = room => {
    return ({id: "PresenceDetected", room: room});
};

// createPresenceGoneEvent :: String => PresenceGoneEvent
const createPresenceGoneEvent = room => {
    return ({id: "PresenceGone", room: room});
};

// presenceDetectedDueToMovementInRoom :: MovementDetectedEvent => Stream<PresenceDetectedEvent | PresenceGoneEvent>
const presenceDetectedDueToMovementInRoom = movementDetectedEvent => {
    const room = getRoomOfMovement(movementDetectedEvent);

    const presenceDetected = Kefir.constant(createPresenceDetectedEvent(room));
    const presenceGone = Kefir.later(120000, createPresenceGoneEvent(room));

    return presenceDetected.merge(presenceGone)
};

const input = new Kefir.pool();

const output = input
    .filter(isMovementDetectedEvent)
    .thru(Util.groupBy(getRoomOfMovement))
    .flatMap( groupedStream => {
        return groupedStream
            .flatMapLatest(presenceDetectedDueToMovementInRoom)
            .skipDuplicates(R.equals);
    });

module.exports = {
    input,
    output
};


