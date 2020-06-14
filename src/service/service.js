const R = require("ramda");
const Kefir = require("kefir");
const Lenses = require('../lenses');

const input = new Kefir.pool();

let state = {};

const stateStream = input
    .map(R.view(Lenses.stateLens))
    .toProperty()
    .onValue(x => state = x);

module.exports = {
    input,
    state,
};
