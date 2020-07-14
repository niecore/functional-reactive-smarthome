const R = require("ramda");
const Kefir = require("kefir");

const Rooms = require("../model/rooms");
const Lights = require("../service/lights");
const Events = require("../events/events");
const Lenses = require("../lenses");

const input = new Kefir.pool();

const isToggleClick = Events.isEvent("ToggleClick");

const createTurnAllLightsInRoomOnEvent = room => Events.createEvent({room: room}, "TurnLightsOn");
const createTurnAllLightsInRoomOffEvent = room => Events.createEvent({room: room}, "TurnAllLightsOff");

// isRoomTooDark :: event => boolean
const hasRoomAllLightsOff = room => event => Lights.lightsInRoomOff(room)(R.view(Lenses.stateLens, event.state));

// changeBrightness :: ToggleClick => Stream<TurnLightOn, TurnAllLightsOff>
const toggleDevicesInRoom = toggleClick => {
    const state = Events.getState(toggleClick);
    const room = toggleClick.room;

    const turnLightsOn = createTurnAllLightsInRoomOnEvent(room)(state);
    const turnLightsOff = createTurnAllLightsInRoomOffEvent(room)(state);

    return hasRoomAllLightsOff(room)(toggleClick) ? turnLightsOn : turnLightsOff;
};

const output = input
    .filter(isToggleClick)
    .map(toggleDevicesInRoom);

module.exports = {
    input,
    output
};
