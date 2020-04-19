const R = require("ramda");
const Kefir = require('kefir');

require('../extend-expect');

const {prop, stream, pool, activate, deactivate, value, error, end, send} = KTU;

describe("Ambientlight tests", () => {

    beforeEach(() => {
        jest.resetModules();
    });

    test.skip('Basic ambient light', () => {
        const AmbientLight = require("../../automations/ambientLight");

        const output = value({device_id_1: {state: "ON"}});
        const output2 = value({device_id_2: {state: "ON"}});
        const output3 = value({device_id_1: {state: "OFF"}, device_id_2: {state: "OFF"}});

        expect(AmbientLight.output).toEmitInTime([[71999001, output], [73799000, output2],  [75599000, output3]], (tick, clock) => {
            const day = new Date("Januar 01, 1970 20:00:00");

            clock.setSystemTime(day);
            tick(3000*3600);
        });
    });
});

