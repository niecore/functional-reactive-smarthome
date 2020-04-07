
const R = require("ramda");
const Kefir = require('kefir');

require('../extend-expect');

const {prop, stream, pool, activate, deactivate, value, error, end, send} = KTU;

describe("Motionlight tests", () => {

    beforeEach(() => {
        jest.resetModules();
    });

    test('Basic motion light turn on', () => {
        const MotionLight = require("../../automations/motionLight");

        const trigger = value([{presence: {light_room: true}}, {}]);
        const output = value({group_light_in_light_room: {state: "ON", brightness: 255}});

        expect(MotionLight.output).toEmit([output, end()], () => {
            send(
                MotionLight.input, [trigger, end()]
            );
        })
    });

    test('Basic motion light turn off', () => {

        const MotionLight = require("../../automations/motionLight");

        const trigger = value([{presence: {light_room: false}}, {}]);
        const output = value({group_light_in_light_room: {state: "OFF"}});

        expect(MotionLight.output).toEmit([output, end()], () => {
            send(
                MotionLight.input, [trigger, end()]
            );
        })
    });

    test('Motion light will not trigger, when room is illuminated', () => {

        const MotionLight = require("../../automations/motionLight");

        const trigger = value([{presence: {light_room: true}}, {motion_sensor_1: {illuminance: 50}}]);
        const output = value({});

        expect(MotionLight.output).toEmit([output, end()], () => {
            send(
                MotionLight.input, [trigger, end()]
            );
        })
    });

    test('Motion light will not trigger, when room has enabled lights', () => {

        const MotionLight = require("../../automations/motionLight");

        const trigger = value([{presence: {light_room: true}}, {light_1: {state: "ON"}}]);
        const output = value({});

        expect(MotionLight.output).toEmit([output, end()], () => {
            send(
                MotionLight.input, [trigger, end()]
            );
        })
    });

    test('Motion light with night light configuration will turn on with minimal brightness during night time', () => {
        const trigger = value([{presence: {light_room2: true}}, {}]);
        const output = value({group_nightlight_in_light_room2: {state: "ON", brightness: 1}});

        jest.doMock("../../model/day_period", () => ({
            itsDayTime: () => false,
            itsNightTime: () => true
        }));

        const MotionLight = require("../../automations/motionLight");

        expect(MotionLight.output).toEmit([output, end()], () => {
            send(
                MotionLight.input, [trigger, end()]
            );
        })
    });

    test('Motion light with night light configuration will turn on normally during daytime', () => {
        const trigger = value([{presence: {light_room2: true}}, {}]);
        const output = value({group_light_in_light_room2: {state: "ON", brightness: 255}});

        jest.doMock("../../model/day_period", () => ({
            itsDayTime: () => true,
            itsNightTime: () => false
        }));

        const MotionLight = require("../../automations/motionLight");

        expect(MotionLight.output).toEmit([output, end()], () => {
            send(
                MotionLight.input, [trigger, end()]
            );
        })
    });

    test('Motion light will turn off after ', () => {
        const trigger = value([{presence: {light_room2: true}}, {}]);
        const output = value({group_light_in_light_room2: {state: "ON", brightness: 255}});

        jest.doMock("../../model/day_period", () => ({
            itsDayTime: () => true,
            itsNightTime: () => false
        }));

        const MotionLight = require("../../automations/motionLight");

        expect(MotionLight.output).toEmit([output, end()], () => {
            send(
                MotionLight.input, [trigger, end()]
            );
        })
    });
});

