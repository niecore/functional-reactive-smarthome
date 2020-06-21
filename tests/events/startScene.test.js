const R = require("ramda");
const Kefir = require('kefir');

require('../extend-expect');

const {prop, stream, pool, activate, deactivate, value, error, end, send} = KTU;

describe("Motionlight tests", () => {

    beforeEach(() => {
        jest.resetModules();
    });

    const startSceneEvent = value({id: "StartScene", scene: "test_scene_1"});
    const startSwitchedSceneEvent = value({id: "StartScene", scene: "test_scene_2"});
    const stopSwitchedSceneEvent = value({id: "StopScene", scene: "test_scene_2"});

    const normalSceneOutput = value(
        {
            device_id_1: {state:  "ON"},
            device_id_2: {
                state: "ON",
                brightness: 255,
                color_temp: 400
            },
            light_1: {
                state: "ON",
                brightness: 255
            }
        }

    );

    test('Start scene event results in device correct output', () => {
        const StartScene = require("../../src/events/startScene");

        expect(StartScene.output).toEmit([normalSceneOutput, end()], () => {
            send(
                StartScene.input, [startSceneEvent, end()]
            );
        })
    });

    test('Start scene event results in device correct output stream in switched scene', () => {
        const StartScene = require("../../src/events/startScene");

        const firstSwitch = value({device_id_1: {state: "ON"}});
        const secondSwitch = value({device_id_2: {state: "ON"}});
        const emptySwitch = value({});

        expect(StartScene.output).toEmitInTime([[0, firstSwitch], [1800*1000, secondSwitch], [3600*1000, emptySwitch], [3600001, firstSwitch]], (tick, clock) => {
            send(
                StartScene.input, [startSwitchedSceneEvent, end()]
            );

            tick(3600000);
        })
    });

    test('Switched stream can be stopped with the StopScene event', () => {
        const StartScene = require("../../src/events/startScene");

        const firstSwitch = value({device_id_1: {state: "ON"}});


        expect(StartScene.output).toEmitInTime([[0, firstSwitch], [1, end()]], (tick, clock) => {
            send(
                StartScene.input, [startSwitchedSceneEvent]
            );

            tick(1);

            send(
                StartScene.input, [stopSwitchedSceneEvent, end()]
            );

            tick(3600*1000)
        })
    });
});

