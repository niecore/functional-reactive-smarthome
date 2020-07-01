const R = require("ramda");
const Kefir = require('kefir');
const Events = require("../../src/events/events");

require('../extend-expect');

const {prop, stream, pool, activate, deactivate, value, error, end, send} = KTU;

describe("Door Window Open Closed Event Tests", () => {

    beforeEach(() => {
        jest.resetModules();
    });

    const doorOpenedMessage = value([{contact_sensor_1: {contact: false}}, {}]);
    const doorClosedMessage = value([{contact_sensor_1: {contact: true}}, {}]);
    const doorOpenedEvent = value(Events.createEvent({device: "contact_sensor_1"}, "DoorOpened")([{contact_sensor_1: {contact: false}}, {}]));
    const doorClosedEvent = value(Events.createEvent({device: "contact_sensor_1"}, "DoorClosed")([{contact_sensor_1: {contact: true}}, {}]));

    const windowOpenedMessage = value([{contact_sensor_2: {contact: false}}, {}]);
    const windowClosedMessage = value([{contact_sensor_2: {contact: true}}, {}]);
    const windowOpenedEvent = value(Events.createEvent({device: "contact_sensor_2"}, "WindowOpened")([{contact_sensor_2: {contact: false}}, {}]));
    const windowClosedEvent = value(Events.createEvent({device: "contact_sensor_2"}, "WindowClosed")([{contact_sensor_2: {contact: true}}, {}]));

    test('Message from contact sensor with door configuration results in DoorOpened event', () => {
        const DoorWindowOpenedClosed = require("../../src/events/doorWindowOpenedClosed");

        expect(DoorWindowOpenedClosed.output).toEmit([doorOpenedEvent, end()], () => {
            send(
                DoorWindowOpenedClosed.input, [doorOpenedMessage, end()]
            );
        })
    });

    test('Message from contact sensor with door configuration results in DoorClosed event', () => {
        const DoorWindowOpenedClosed = require("../../src/events/doorWindowOpenedClosed");

        expect(DoorWindowOpenedClosed.output).toEmit([doorClosedEvent, end()], () => {
            send(
                DoorWindowOpenedClosed.input, [doorClosedMessage, end()]
            );
        })
    });

    test('Message from contact sensor with window configuration results in WindowOpened event', () => {
        const DoorWindowOpenedClosed = require("../../src/events/doorWindowOpenedClosed");

        expect(DoorWindowOpenedClosed.output).toEmit([windowOpenedEvent, end()], () => {
            send(
                DoorWindowOpenedClosed.input, [windowOpenedMessage, end()]
            );
        })
    });

    test('Message from contact sensor with window configuration results in WindowClosed event', () => {
        const DoorWindowOpenedClosed = require("../../src/events/doorWindowOpenedClosed");

        expect(DoorWindowOpenedClosed.output).toEmit([windowClosedEvent, end()], () => {
            send(
                DoorWindowOpenedClosed.input, [windowClosedMessage, end()]
            );
        })
    });
});



