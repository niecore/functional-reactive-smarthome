
const R = require("ramda");
const Kefir = require('kefir');

require('../extend-expect');

const {prop, stream, pool, activate, deactivate, value, error, end, send} = KTU;

describe("Presence tests", () => {

    beforeEach(() => {
        jest.resetModules();
    });

    test('Presence basic test', () => {
        const Presence = require("../../model/presence");

        const trigger = value([{motion_sensor_1: {occupancy: true}}, {}]);
        const enable = value({presence: {light_room: true}});
        const disable = value({presence: {light_room: false}});

        expect(Presence.output).toEmitInTime([[0, enable],  [120*1000, disable], [120*1000, end()]], (tick, clock) => {
            send(
                Presence.input, [trigger, end()]
            );
            tick(120*1000)
        });
    });

    test('Presence is extended after new motion detection with no new event', () => {
        const Presence = require("../../model/presence");

        const trigger = value([{motion_sensor_1: {occupancy: true}}, {}]);
        const enable = value({presence: {light_room: true}});
        const disable = value({presence: {light_room: false}});

        expect(Presence.output).toEmitInTime([[0, enable],  [(119+120)*1000, disable], [(119+120)*1000, end()]], (tick, clock) => {
            send(Presence.input, [trigger]);
            tick(119*1000);
            send(Presence.input, [trigger, end()]);
            tick(120*1000);
        });
    });

    test('Presence is not interrupted by motion of other room', () => {
        const Presence = require("../../model/presence");


        const trigger = value([{motion_sensor_1: {occupancy: true}}, {}]);
        const enable = value({presence: {light_room: true}});
        const disable = value({presence: {light_room: false}});

        const trigger_other_room = value([{motion_sensor_2: {occupancy: true}}, {}]);
        const enable_other_room = value({presence: {light_room2: true}});
        const disable_other_room = value({presence: {light_room2: false}});

        expect(Presence.output).toEmitInTime([[0, enable], [1*1000, enable_other_room],  [120*1000, disable], [121*1000, disable_other_room], [121*1000, end()]], (tick, clock) => {
            send(Presence.input, [trigger]);
            tick(1*1000);
            send(Presence.input, [trigger_other_room, end()]);
            tick(120*1000);
        });
    });
});


