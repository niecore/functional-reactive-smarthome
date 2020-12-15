const R = require("ramda");
const Kefir = require("kefir");

const Rooms = require("../model/rooms");
const Lights = require("../service/lights");
const Events = require("../events/events");
const Lenses = require("../lenses");
const TurnLightOnOff = require("../events/turnLightOnOff")

const input = new Kefir.pool();

const isToggleClick = Events.isEvent("ButtonToggleClick");

// isRoomTooDark :: event => boolean
const hasRoomAllLightsOff = room => event => Lights.lightsInRoomOff(room)(R.view(Lenses.stateLens, event.state));

// changeBrightness :: ButtonToggleClick => Stream<TurnLightOn, TurnLightsOff>
const toggleDevicesInRoom = toggleClick => {
    const state = Events.getState(toggleClick);
    const room = Rooms.getRoomOfDevice(toggleClick.remote);

    const turnLightsOn = TurnLightOnOff.createTurnAllLightsInRoomOnEvent(room)(state);
    const turnLightsOff = TurnLightOnOff.createTurnAllLightsInRoomOffEvent(room)(state);

    return hasRoomAllLightsOff(room)(toggleClick) ? turnLightsOn : turnLightsOff;
};

const output = input
    .filter(isToggleClick)
    .map(toggleDevicesInRoom);

module.exports = {
    input,
    output
};
