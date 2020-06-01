const R = require("ramda");
const Kefir = require("kefir");

//
const Rooms = require("../rooms");

const isLightOnEvent = R.propEq("id", "TurnLightsOn");

const input = new Kefir.pool();

const output = input
    .filter(isLightOnEvent)
    .map(lightOnEvent => {
        const lightsInRoom = Rooms.getDevicesInRoom(lightOnEvent.room)
            .filter()
    });

module.exports = {
    input,
    output
};


