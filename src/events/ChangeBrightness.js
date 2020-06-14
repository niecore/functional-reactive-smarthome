const R = require("ramda");
const Kefir = require("kefir");

const Rooms = require("../model/rooms");
const Devices = require("../model/devices");
const Lights = require("../service/lights");

const isChangeBrightnessEvent = R.propEq("id", "ChangeBrightness");

const input = new Kefir.pool();

const output = input
    .filter(isChangeBrightnessEvent)
    .map(changeBrightnessEvent => {

        const lightsInRoom = Rooms.getDevicesInRoom(changeBrightnessEvent.room)
            .filter(Devices.isLight);

        const brightnessOfLights = lightsInRoom
            .map(Lights.getBrightnessOfLight)
            .map(R.add(changeBrightnessEvent.brightness))
            .map(R.clamp(0, 255))
            .map(x => ({brightness: x}));

        return R.zipObj(lightsInRoom, brightnessOfLights);
    });

module.exports = {
    input,
    output
};


