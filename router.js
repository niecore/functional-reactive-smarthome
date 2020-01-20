const Bacon = require("baconjs");
const Zigbee = require('./interfaces/zigbee');
const RA = require('ramda-adjunct');
const R = require('ramda');

const output = new Bacon.Bus();

const update = Bacon.mergeAll(Zigbee.deviceInputStream);
const state = update.scan({}, R.mergeDeepRight);
const input = state.zip(update, (state, input) => [input, state]);

Zigbee.deviceOutputStream.plug(output);

module.exports = {
    output,
    input,
};
