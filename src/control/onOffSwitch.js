const R = require("ramda");
const Kefir = require("kefir");

const Rooms = require("../model/rooms");
const Lights = require("../service/lights");
const Events = require("../events/events");
const Lenses = require("../lenses");
const Remote = require("../model/remotes")
const TurnLightOnOff = require("../events/turnLightOnOff")
const input = new Kefir.pool();

const isOnClick = Events.isEvent("ButtonOnClick");
const isOffClick = Events.isEvent("ButtonOffClick");

// changeBrightness :: ButtonOnClick => Stream<TurnLightOn>
const turnDeviceOn = onoOffClick => {
    const bind = Remote.getRemoteByName(onoOffClick.remote).bind
    return TurnLightOnOff.createTurnLightOnEvent(bind)(onoOffClick.state);
}

// changeBrightness :: ButtonOffClick => Stream<TurnLightOn>
const turnDeviceOff = onoOffClick => {
    const bind = Remote.getRemoteByName(onoOffClick.remote).bind
    return TurnLightOnOff.createTurnLightOffEvent(bind)(onoOffClick.state);
};

const onStream = input
    .filter(isOnClick)
    .map(turnDeviceOn);

const offStream = input
    .filter(isOffClick)
    .map(turnDeviceOff);

const output = onStream.merge(offStream)

module.exports = {
    input,
    output
};
