const R = require("ramda");
const Kefir = require('kefir');

require('../extend-expect');

const {prop, stream, pool, activate, deactivate, value, error, end, send} = KTU;

describe("Motionlight tests", () => {

    beforeEach(() => {
        jest.resetModules();
    });

    const presenceDetected = value({id: "PresenceDetected", room: "light_room", state: [{},{}]});
    const presenceGone = value({id: "PresenceGone", room: "light_room", state: [{},{}]});
    const turnLightsOn = value({id: "TurnLightsOn", room: "light_room", state: [{},{}]});
    const turnLightsOff = value({id: "TurnAllLightsOff", room: "light_room", state: [{},{}]});
    const turnNightLightsOn = value({id: "TurnNightLightsOn", room: "light_room2", state: [{},{}]});

    test('Basic motion light turn on', () => {
        const MotionLight = require("../../src/automations/motionLight");

        expect(MotionLight.output).toEmit([turnLightsOn, end()], () => {
            send(
                MotionLight.input, [presenceDetected, end()]
            );
        })
    });

    test('Basic motion light turn off', () => {

        const MotionLight = require("../../src/automations/motionLight");

        expect(MotionLight.output).toEmit([turnLightsOn, turnLightsOff, end()], () => {
            send(
                MotionLight.input, [presenceDetected, presenceGone, end()]
            );
        })
    });

    test('Motion light will not presenceDetected, when room is illuminated', () => {

        jest.doMock("../../src/service/luminosity", () => ({
            isRoomToDark: () => () => false
        }));

        const MotionLight = require("../../src/automations/motionLight");

        expect(MotionLight.output).toEmit([end()], () => {
            send(
                MotionLight.input, [presenceDetected, end()]
            );
        })
    });

    test('Motion light will presenceDetected, when room is to dark', () => {

        jest.doMock("../../src/service/luminosity", () => ({
            isRoomToDark: () => () => true
        }));

        const MotionLight = require("../../src/automations/motionLight");

        expect(MotionLight.output).toEmit([turnLightsOn, end()], () => {
            send(
                MotionLight.input, [presenceDetected, end()]
            );
        })
    });

    test('Motion light will not presenceDetected, when room has enabled lights', () => {

        jest.doMock("../../src/service/lights", () => ({
            lightsInRoomOff: () => () => false
        }));

        const MotionLight = require("../../src/automations/motionLight");

        expect(MotionLight.output).toEmit([end()], () => {
            send(
                MotionLight.input, [presenceDetected, end()]
            );
        })
    });

    test('Motion light will turn light off, when after it has not turned on', () => {

        jest.doMock("../../src/service/lights", () => ({
            lightsInRoomOff: () => () => true
        }));

        const MotionLight = require("../../src/automations/motionLight");

        expect(MotionLight.output).toEmit([turnLightsOn, end()], () => {
            send(
                MotionLight.input, [presenceDetected, end()]
            );
        })
    });

    test('Motion light with night light configuration will turn on with minimal brightness during night time', () => {

        jest.doMock("../../src/model/dayPeriod", () => ({
            itsDayTime: () => () => false,
            itsNightTime: () => () => true
        }));

        const MotionLight = require("../../src/automations/motionLight");

        const presenceDetected = value({ state: [{},{}], id: "PresenceDetected", room: "light_room2"});

        expect(MotionLight.output).toEmit([turnNightLightsOn, end()], () => {
            send(
                MotionLight.input, [presenceDetected, end()]
            );
        })
    });

    test('Motion light with night light configuration will turn on normally during daytime', () => {
        const output = value({ state: [{},{}], id: "TurnLightsOn", room: "light_room2"});
        const presenceDetected = value({ state: [{},{}], id: "PresenceDetected", room: "light_room2"});

        jest.doMock("../../src/model/dayPeriod", () => ({
            itsDayTime: () => true,
            itsNightTime: () => false
        }));

        const MotionLight = require("../../src/automations/motionLight");

        expect(MotionLight.output).toEmit([output, end()], () => {
            send(
                MotionLight.input, [presenceDetected, end()]
            );
        })
    });

    test('Motion light will not turn light off whenever a light has changed during the presence', () => {

        const startSceneInRoom = value({ state: [{},{}], id: "StartScene", scene: "test_scene_1"});
        const noAction = value({ state: [{},{}], id: "NoAction"});

        const MotionLight = require("../../src/automations/motionLight");

        expect(MotionLight.output).toEmit([turnLightsOn, noAction, end()], () => {
            send(
                MotionLight.input, [presenceDetected, startSceneInRoom, end()]
            );
        })
    });
});

