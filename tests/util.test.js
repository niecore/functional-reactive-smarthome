const Lenses = require("../src/lenses");
const R = require("ramda");
const Kefir = require('kefir');

require('./extend-expect');

const {prop, stream, pool, activate, deactivate, value, error, end, send} = KTU;

test('throttleOncePerDay throttles consecutive values', () => {
    const Util = require("../src/util");

    const sample = value(true);
    const input = new Kefir.pool();

    const output = input.thru(Util.throttleOncePerDay);

    expect(output).toEmitInTime([[0, sample]], (tick, clock) => {
        send(input, [sample]);
        tick(1);
        send(input, [sample]);
    });
});

test('throttleOncePerDay is activate again after midnight', () => {
    const Util = require("../src/util");

    const sample = value(true);
    const input = new Kefir.pool();

    const output = input.thru(Util.throttleOncePerDay);

    expect(output).toEmitInTime([[0, sample], [86400000, sample]], (tick, clock) => {
        send(input, [sample]);
        tick(24*60*60*1000);
        send(input, [sample]);
    });
});
