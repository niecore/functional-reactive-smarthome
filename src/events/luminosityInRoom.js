const R = require("ramda");
const Kefir = require("kefir");
const Events = require("./events");

const Lenses = require('../lenses');
const Rooms = require('../model/rooms');

// isMessageWithLuminosity :: Msg => Boolean
const isMessageWithLuminosity = R.pipe(
    R.view(Lenses.inputDataLens),
    R.has("illuminance_lux")
);

// createRoomToDarkEvent :: String => RoomToDark
const createRoomToDarkEvent = room => Events.createEvent({room: room}, "RoomToDark");

// createRoomBrightEnoughEvent :: String => RoomBrightEnough
const createRoomBrightEnoughEvent = room => Events.createEvent({room: room}, "RoomBrightEnough");

// createLuminosityEventForRoom :: Msg => Either[RoomToDark, RoomBrightEnough]
const createLuminosityEventForRoom = msg => {
    const room = Rooms.getRoomOfMessage(msg);
    const luminosity = R.prop("illuminance_lux")(R.view(Lenses.inputDataLens)(msg));

    const roomToDarkEvent = createRoomToDarkEvent(room)(msg);
    const roomBrightEnoughEvent = createRoomBrightEnoughEvent(room)(msg);

    return R.gt(luminosity, darkIndoors) ? roomBrightEnoughEvent : roomToDarkEvent
};

// https://docs.microsoft.com/en-us/windows/win32/sensorsapi/understanding-and-interpreting-lux-values
const darkIndoors = 50;
const dimIndoors = 200;
const normalIndoors = 400;
const brightIndoors = 1000;
const dimOutdoors = 5000;
const cloudyOutdoors = 10000;
const directSunlight = 30000;

const input = new Kefir.pool();

const output = input
    .filter(isMessageWithLuminosity)
    .map(createLuminosityEventForRoom);

module.exports = {
    input,
    output
};


