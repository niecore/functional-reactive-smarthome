const Bacon = require("baconjs");
const R = require('ramda');

const output = new Bacon.Bus();
const update = new Bacon.Bus();

const state = update.scan({}, R.mergeDeepRight);
const input = state.zip(update, (state, input) => [input, state]);

module.exports = {
    output,
    input,
    update
};
