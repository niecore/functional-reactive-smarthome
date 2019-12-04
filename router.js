const Bacon = require("baconjs");
const Zigbee = require('./interfaces/zigbee');
const RA = require('ramda-adjunct');
const R = require('ramda');

const output = new Bacon.Bus();

output.plug(
    Zigbee.deviceOutputStream
);

const update = Bacon.mergeAll(Zigbee.deviceInputStream);
const state = update.scan({}, R.mergeDeepRight);
const input = state.zip(update, (state, input) => [state, input]);

input
    .doLog()
    .subscribe();


console.log("Starting functional-reactive-smart-home.");

module.exports = {
    output,
    input,
};
