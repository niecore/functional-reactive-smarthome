const Bacon = require("baconjs");
const RA = require('ramda-adjunct');
const R = require('ramda');
const Zigbee = require('./interfaces/zigbee');
const Shelly = require('./interfaces/shelly');
const Devices = require("./model/devices");
const Util = require('./model/util');

const output = new Bacon.Bus();

const update = Bacon.mergeAll(Zigbee.deviceInputStream, Shelly.deviceInputStream);
const state = update.scan({}, R.mergeDeepRight);
const input = state.zip(update, (state, input) => [input, state]);

const filterMsgByDeviceInterface = interface => R.pipe(
    Util.convertToArray,
    R.filter(input => Devices.deviceHasInterface(interface)(input.key)),
    Util.convertFromArray
);

Zigbee.deviceOutputStream.plug(output.map(R.filter(filterMsgByDeviceInterface("zigbee"))));
Shelly.deviceOutputStream.plug(output.map(R.filter(filterMsgByDeviceInterface("shelly"))));

module.exports = {
    output,
    input,
};