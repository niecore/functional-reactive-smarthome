const R = require("ramda");
const Kefir = require("kefir");

const Rooms = require("../model/rooms");
const Devices = require("../model/devices");
const Lights = require("../service/lights");
const Events = require("./events");
const Lenses = require("../lenses");

const isChangeBrightnessEvent = Events.isEvent("ChangeBrightness");

const input = new Kefir.pool();

// getBrightnessOfLight :: Event => String => boolen
const getBrightnessOfLight = event => light => Lights.getBrightnessOfLight(light)(R.view(Lenses.stateLens, event.state));

const output = input
    .filter(isChangeBrightnessEvent)
    .map(changeBrightnessEvent => {

        const lightsInRoom = Rooms.getDevicesInRoom(changeBrightnessEvent.room)
            .filter(Devices.isLight);

        const brightnessOfLights = lightsInRoom
            .map(getBrightnessOfLight(changeBrightnessEvent))
            .map(R.add(changeBrightnessEvent.brightness))
            .map(R.clamp(0, 255))
            .map(x => ({brightness: x}));

        return R.zipObj(lightsInRoom, brightnessOfLights);
    });

module.exports = {
    input,
    output
};


