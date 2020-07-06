const R = require("ramda");
const Kefir = require('kefir');
const Events = require("../../src/events/events");

require('../extend-expect');

const {prop, stream, pool, activate, deactivate, value, error, end, send} = KTU;

describe("Irregation and Fertilization Required Tests", () => {

    beforeEach(() => {
        jest.resetModules();
    });

    const lowSoilMoisture = value([{flower_sensor_1: {soil_moisture: 0}}, {}]);
    const lowFertility = value([{flower_sensor_1: {fertility: 0}}, {}]);

    const testFlower = {
        alias: "Chilis",
        sensor: "flower_sensor_1",
        species: "capsicum annuum"
    };

    const irregationRequiredEvent = value(Events.createEvent(testFlower, "IrrigationRequired")([{flower_sensor_1: {soil_moisture: 0}}, {}]));
    const fertilizationRequiredEvent = value(Events.createEvent(testFlower, "FertilizationRequired")([{flower_sensor_1: {fertility: 0}}, {}]));

    test('When soil humidity is measured under the the threshhold a IrregationRequired Event is sent', () => {
        const IrregationFerrtilizationRequired = require("../../src/events/irrigationFertilizationRequired");

        expect(IrregationFerrtilizationRequired.output).toEmit([irregationRequiredEvent, end()], () => {
            send(
                IrregationFerrtilizationRequired.input, [lowSoilMoisture, end()]
            );
        })
    });

    test('When fertility is measured under the the threshhold a FertilizationRequired Event is sent', () => {
        const IrregationFerrtilizationRequired = require("../../src/events/irrigationFertilizationRequired");

        expect(IrregationFerrtilizationRequired.output).toEmit([fertilizationRequiredEvent, end()], () => {
            send(
                IrregationFerrtilizationRequired.input, [lowFertility, end()]
            );
        })
    });
});



