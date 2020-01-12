const Bacon = require("baconjs");
const Zigbee = require('./interfaces/zigbee');
const RA = require('ramda-adjunct');
const R = require('ramda');

const output = new Bacon.Bus();

const inputNameLens = R.lens(R.pipe(R.head, R.keys, R.head), R.identity);   // setter not implemented
const inputDataLens = R.lens(R.pipe(R.head, R.values, R.head), R.identity); // setter not implemented
const stateLens = R.lens(R.nth(1), R.identity);                             // setter not implemented

const update = Bacon.mergeAll(Zigbee.deviceInputStream);
const state = update.scan({}, R.mergeDeepRight);
const input = state.zip(update, (state, input) => [input, state]);

Zigbee.deviceOutputStream.plug(output);

module.exports = {
    output,
    input,
    inputNameLens,
    inputDataLens,
    stateLens,
};
