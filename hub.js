const Kefir = require("kefir");
const R = require('ramda');

const output = new Kefir.pool();
const update = new Kefir.pool();
const events = new Kefir.pool();

const state = update.scan(R.mergeDeepRight, {});
const input = state.zip(update, (state, input) => [input, state]);

module.exports = {
    output,
    input,
    update
};
