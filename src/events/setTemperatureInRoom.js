const R = require("ramda");
const Kefir = require("kefir");

const Rooms = require("../model/rooms");
const Devices = require("../model/devices");
const Events = require("./events");

const isSetTemperatureInRoomEvent = Events.isEvent("SetTemperatureInRoom");

const input = new Kefir.pool();

const output = input
    .filter(isSetTemperatureInRoomEvent)
    .map(setTemperatureInRoomEvent => {
        const climateControllerInRoom = Rooms.getDevicesInRoom(setTemperatureInRoomEvent.room)
            .filter(Devices.deviceHasType("etrv"));

        const setpointCommand = climateControllerInRoom
            .map(device_name => R.objOf(device_name, {setpoint: setTemperatureInRoomEvent.temperature}));

        return R.reduce(R.mergeLeft(), {}, setpointCommand);
    });

module.exports = {
    input,
    output
};


