const R = require("ramda");
const Kefir = require('kefir');

require('../extend-expect');

const {prop, stream, pool, activate, deactivate, value, error, end, send} = KTU;

describe("Open Window Rain Alert Tests", () => {

    beforeEach(() => {
        jest.resetModules();
    });

    const startedToRainOpenWindows = value({id: "StartedToRain", state: [{},{contact_sensor_2: {contact: false}}]});
    const startedToRainNoOpenWindows = value({id: "StartedToRain", state: [{},{contact_sensor_2: {contact: true}}]});

    const notifcation = value({id: "NotifyUser", message: "It might rain soon and your windows are open."});

    test.skip('Notification when windows are open', () => {
        const RainOpenWindowAlert = require("../../src/automations/rainOpenWindowAlert");

        expect(RainOpenWindowAlert.output).toEmit([notifcation, end()], () => {
            send(
                RainOpenWindowAlert.input, [startedToRainOpenWindows, end()]
            );
        })
    });
});

