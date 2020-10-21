const R = require("ramda");
const Kefir = require("kefir");

const Rooms = require("../model/rooms");
const Devices = require("../model/devices");
const Events = require("./events");

const isEnableHeatReductionInRoomEvent = Events.isEvent("EnableHeatReductionInRoom");
const isDisableHeatReductionInRoomEvent = Events.isEvent("DisableHeatReductionInRoom");
const heatReductionInRoomEvent = R.anyPass([isEnableHeatReductionInRoomEvent, isDisableHeatReductionInRoomEvent]);

const input = new Kefir.pool();

const output = input
    .filter(heatReductionInRoomEvent)
    .map(heatReductionEvent => {
        const enable = isEnableHeatReductionInRoomEvent(heatReductionEvent);

        const climateControllerInRoom = Rooms.getDevicesInRoom(heatReductionEvent.room)
            .filter(Devices.deviceHasType("etrv"));

        const heatReductionCommand = climateControllerInRoom
            .map(device_name => R.objOf(device_name, {heat_reduction: enable}));

        return R.reduce(R.mergeLeft(), {}, heatReductionCommand);
    });

module.exports = {
    input,
    output
};


