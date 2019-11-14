const Bacon = require("baconjs");
const ZigbeeInterface = require('./interfaces/zigbee');

const deviceOutputStream = new Bacon.Bus();

deviceOutputStream.plug(ZigbeeInterface.deviceOutputStream);

exports.deviceInputStream = Bacon.mergeAll(
    ZigbeeInterface.deviceInputStream
);

exports.deviceOutputStream = deviceOutputStream;
