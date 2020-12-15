const R = require("ramda");
const Kefir = require("kefir");

const Rooms = require("../model/rooms");
const Devices = require("../model/devices");
const Events = require("./events");

const isLightOnEvent = Events.isEvent("TurnLightsOn");
const isLightOffEvent = Events.isEvent("TurnLightsOff");
const isLightEvent = R.anyPass([isLightOnEvent, isLightOffEvent]);

const lightEventForRoom = R.has("room")
const lightEventForSingeLight = R.has("device")

const lightOffCommand = device => R.objOf(device, {state: "OFF"})
const lightOnCommand = device => R.objOf(device, {state: "ON", brightness: 255})
const getLightCommand = device => event => isLightOnEvent(event) ? lightOnCommand(device) : lightOffCommand(device)

const input = new Kefir.pool();

const lightOnStream = input
    .filter(isLightEvent)

const lightOnInDeviceStream = lightOnStream
    .filter(lightEventForSingeLight)
    .map(lightOnEvent => getLightCommand(lightOnEvent.device)(lightOnEvent));

const lightOnInRoomStream = lightOnStream
    .filter(lightEventForRoom)
    .map(lightOnEvent => {
        const lightsInRoom = Rooms.getDevicesInRoom(lightOnEvent.room)
            .filter(Devices.isLight);

        const lightCommands = lightsInRoom
            .map(device_name => getLightCommand(device_name)(lightOnEvent));

        return R.reduce(R.mergeLeft(), {}, lightCommands);
    });


const output = lightOnInDeviceStream.merge(lightOnInRoomStream)

const createTurnAllLightsInRoomOnEvent = room => Events.createEvent({room: room}, "TurnLightsOn");
const createTurnAllLightsInRoomOffEvent = room => Events.createEvent({room: room}, "TurnLightsOff");
const createTurnLightOnEvent = device => Events.createEvent({device: device}, "TurnLightsOn");
const createTurnLightOffEvent = device => Events.createEvent({device: device}, "TurnLightsOff");


module.exports = {
    input,
    output,
    createTurnAllLightsInRoomOnEvent,
    createTurnAllLightsInRoomOffEvent,
    createTurnLightOnEvent,
    createTurnLightOffEvent,
};


