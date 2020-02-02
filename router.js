const Bacon = require("baconjs");
const RA = require('ramda-adjunct');
const R = require('ramda');
const Zigbee = require('./interfaces/zigbee');
const Shelly = require('./interfaces/shelly');

const output = new Bacon.Bus();

const update = Bacon.mergeAll(Zigbee.deviceInputStream, Shelly.deviceInputStream);
const state = update.scan({}, R.mergeDeepRight);
const input = state.zip(update, (state, input) => [input, state]);

Zigbee.deviceOutputStream.plug(output);
Shelly.deviceOutputStream.plug(output);

module.exports = {
    output,
    input,
};
