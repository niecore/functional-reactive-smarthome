const Bacon = require("baconjs");
const ZigbeeInterface = require('./interfaces/zigbee');

const deviceOutputStream = new Bacon.Bus();

deviceOutputStream.plug(
    ZigbeeInterface.deviceOutputStream)
;

const deviceInputStream = Bacon.mergeAll(
    ZigbeeInterface.deviceInputStream
);

module.exports = {
    deviceInputStream,
    deviceOutputStream,
};

console.log("Starting functional-reactive-smart-home.");