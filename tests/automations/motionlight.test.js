
const R = require("ramda");
const Kefir = require('kefir');

require('../extend-expect');

const {prop, stream, pool, activate, deactivate, value, error, end, send} = KTU;

describe("Motionlight tests", () => {

    beforeEach(() => {
        jest.resetModules();
    });

    test('Basic motion light turn on', () => {
        const MotionLight = require("../../src/automations/motionLight");

        const trigger = value([{presence: {light_room: true}}, {}]);
        const output = value({light_1: {state: "ON", brightness: 255}});

        expect(MotionLight.output).toEmit([output, end()], () => {
            send(
                MotionLight.input, [trigger, end()]
            );
        })
    });

    test('Basic motion light turn off', () => {

        const MotionLight = require("../../src/automations/motionLight");

        const trigger = value([{presence: {light_room: false}}, {}]);
        const output = value({light_1: {state: "OFF"}});

        expect(MotionLight.output).toEmit([output, end()], () => {
            send(
                MotionLight.input, [trigger, end()]
            );
        })
    });

    test('Motion light will not trigger, when room is illuminated', () => {

        const MotionLight = require("../../src/automations/motionLight");

        const trigger = value([{presence: {light_room: true}}, {motion_sensor_1: {illuminance_lux: 3000}}]);
        const output = value({});

        expect(MotionLight.output).toEmit([output, end()], () => {
            send(
                MotionLight.input, [trigger, end()]
            );
        })
    });

    test('Motion light will trigger, when room is to dark', () => {

        const MotionLight = require("../../src/automations/motionLight");

        const trigger = value([{presence: {light_room: true}}, {motion_sensor_1: {illuminance_lux: 49}}]);
        const output = value({light_1: {state: "ON", brightness: 255}});

        expect(MotionLight.output).toEmit([output, end()], () => {
            send(
                MotionLight.input, [trigger, end()]
            );
        })
    });

    test('Motion light will not trigger, when room has enabled lights', () => {

        const MotionLight = require("../../src/automations/motionLight");

        const trigger = value([{presence: {light_room: true}}, {light_1: {state: "ON"}}]);
        const output = value({});

        expect(MotionLight.output).toEmit([output, end()], () => {
            send(
                MotionLight.input, [trigger, end()]
            );
        })
    });

    test('Motion light will turn light off, when after it has not turned on', () => {

        const MotionLight = require("../../src/automations/motionLight");

        const trigger = value([{presence: {light_room: true}}, {light_1: {state: "ON"}}]);
        const trigger_off = value([{presence: {light_room: false}}, {light_1: {state: "ON"}}]);
        const output = value({});

        expect(MotionLight.output).toEmit([output, output, end()], () => {
            send(
                MotionLight.input, [trigger, trigger_off, end()]
            );
        })
    });

    test('Motion light with night light configuration will turn on with minimal brightness during night time', () => {
        const trigger = value([{presence: {light_room2: true}}, {}]);
        const output = value({light_2: {state: "ON", brightness: 1}});

        jest.doMock("../../src/day_period", () => ({
            itsDayTime: () => false,
            itsNightTime: () => true
        }));

        const MotionLight = require("../../src/automations/motionLight");

        expect(MotionLight.output).toEmit([output, end()], () => {
            send(
                MotionLight.input, [trigger, end()]
            );
        })
    });

    test('Motion light with night light configuration will turn on normally during daytime', () => {
        const trigger = value([{presence: {light_room2: true}}, {}]);
        const output = value({light_2: {state: "ON", brightness: 255}, light_3: {state: "ON", brightness: 255}});

        jest.doMock("../../src/day_period", () => ({
            itsDayTime: () => true,
            itsNightTime: () => false
        }));

        const MotionLight = require("../../src/automations/motionLight");

        expect(MotionLight.output).toEmit([output, end()], () => {
            send(
                MotionLight.input, [trigger, end()]
            );
        })
    });

    test('Motion light will not turn light off whenever a light has changed during the presence', () => {
        const trigger = value([{presence: {light_room2: true}}, {}]);
        const output = value({light_2: {state: "ON", brightness: 255}, light_3: {state: "ON", brightness: 255}});
        const second_trigger = value([{presence: {light_room2: false}}, {light_3: {state: "ON", brightness: 122}}]);

        jest.doMock("../../src/day_period", () => ({
            itsDayTime: () => true,
            itsNightTime: () => false
        }));

        const MotionLight = require("../../src/automations/motionLight");

        expect(MotionLight.output).toEmit([output, value({}), end()], () => {
            send(
                MotionLight.input, [trigger, second_trigger, end()]
            );
        })
    });
});

