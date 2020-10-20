const R = require("ramda");
const Kefir = require('kefir');

require('../extend-expect');

const {prop, stream, pool, activate, deactivate, value, error, end, send} = KTU;

describe("Climate tests", () => {

    beforeEach(() => {
        jest.resetModules();
    });

    test('Basic climate test', () => {
        const Climate = require("../../src/automations/climate");

        const output = value({id: "SetTemperatureInRoom", room: "first_room", temperature: 19, state: [{}, {}]} );
        const output2 = value({id: "SetTemperatureInRoom", room: "first_room", temperature: 20, state: [{}, {}]} );

        expect(Climate.output).toEmitInTime([[3599000, output], [25199000, output2]], (tick, clock) => {
            const day = new Date("Januar 01, 1970 00:00:00");
            clock.setSystemTime(day);
            tick(2*1000*60*60);
            tick(6*1000*60*60);
        });
    });
});

