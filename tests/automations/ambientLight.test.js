const R = require("ramda");
const Kefir = require('kefir');

require('../extend-expect');

const {prop, stream, pool, activate, deactivate, value, error, end, send} = KTU;

describe("Ambientlight tests", () => {

    beforeEach(() => {
        jest.resetModules();
    });

    test.skip('Basic ambient light', () => {
        const AmbientLight = require("../../src/automations/ambientLight");

        const output = value({id: "StartScene", scene: "test_scene_2"});
        const output2 = value({id: "StopScene", scene: "test_scene_2"});
        const output3 = value({id: "StartScene", scene: "test_scene_3"});

        expect(AmbientLight.output).toEmitInTime([[71999000, output], [75599000, output2], [75599000, output3]], (tick, clock) => {
            const day = new Date("Januar 01, 1970 20:00:00");

            clock.setSystemTime(day);
            tick(3000*3600);
        });
    });
});

