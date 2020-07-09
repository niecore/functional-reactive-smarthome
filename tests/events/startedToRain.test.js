const R = require("ramda");
const Kefir = require('kefir');
const Events = require("../../src/events/events");

require('../extend-expect');

const {prop, stream, pool, activate, deactivate, value, error, end, send} = KTU;

describe("Started To Rain Event Tests", () => {

    beforeEach(() => {
        jest.resetModules();
    });

    const someRain = value([{weather: {current: {rain: 1}}}, {}]);
    const noRain = value([{weather: {current: {rain: 0}}}, {}]);
    const rainStopped = value([{weather: {current: {rain: 0}}}, {weather: {current: {rain: 1}}}]);

    const startedToRainEvent = value(Events.createBasicEvent("StartedToRain")([{weather: {current: {rain: 1}}}, {}]));
    const stoppedToRainEvent = value(Events.createBasicEvent("StoppedToRain")([{weather: {current: {rain: 0}}}, {weather: {current: {rain: 1}}}]));

    test('Weather event with no rain will not trigger the rain has started event ', () => {
        const StartedToRain = require("../../src/events/startedToRain");

        expect(StartedToRain.output).toEmit([end()], () => {
            send(
                StartedToRain.input, [noRain, end()]
            );
        })
    });

    test('Weather event with some rain will trigger the rain has started event ', () => {
        const StartedToRain = require("../../src/events/startedToRain");

        expect(StartedToRain.output).toEmit([startedToRainEvent, end()], () => {
            send(
                StartedToRain.input, [someRain, end()]
            );
        })
    });

    test('Two Weather event with some rain will not trigger the rain has started event twice ', () => {
        const StartedToRain = require("../../src/events/startedToRain");

        expect(StartedToRain.output).toEmit([startedToRainEvent, end()], () => {
            send(
                StartedToRain.input, [someRain, someRain, end()]
            );
        })
    });

    test('Has Stopped raining event is sent after rain has stopped ', () => {
        const StartedToRain = require("../../src/events/startedToRain");

        expect(StartedToRain.output).toEmit([stoppedToRainEvent, end()], () => {
            send(
                StartedToRain.input, [rainStopped, end()]
            );
        })
    });

    test('Rain event can be received after stopped rain event', () => {
        const StartedToRain = require("../../src/events/startedToRain");

        expect(StartedToRain.output).toEmit([startedToRainEvent, stoppedToRainEvent, startedToRainEvent, end()], () => {
            send(
                StartedToRain.input, [someRain, rainStopped, someRain, end()]
            );
        })
    });
});



