const R = require('ramda');
const Kefir = require('kefir');
const parse = require('csv-parse/lib/sync');
const fs = require('fs');
const path = require("path");

const Lenses = require("../lenses");
const Devices = require("../model/devices");
const Events = require("./events.js");
const Util = require("../util");
const Flowers = require("../../config/flowers");

// configuredPlantSpecies :: [String]
const configuredPlantSpecies = R.map(R.prop("species"), Flowers.flowers);

// plantDb :: [Plant]
const plantDb = R.pipe(
    x => fs.readFileSync(path.resolve(__dirname, x), "utf-8"),
    x => parse(x, {columns: true, skip_empty_lines: true}),
    R.filter(x => R.includes(x.pid, configuredPlantSpecies)),
)("../data/flowerDb.csv");

// isPlantSensor :: Msg => Boolean
const isPlantSensor = R.pipe(
    R.view(Lenses.inputNameLens),
    Devices.deviceHasType("plant_sensor")
);

// isFertilityMessage :: Msg => Boolean
const isFertilityMessage = R.pipe(
    R.view(Lenses.inputDataLens),
    R.has("fertility")
);

// isSoilMoistureMessage :: Msg => Boolean
const isSoilMoistureMessage = R.pipe(
    R.view(Lenses.inputDataLens),
    R.has("soil_moisture")
);

// // getFlowerConfiguration :: String => Flower
const getFlowerConfiguration = device => R.pipe(
    R.filter(R.propEq("sensor", device)),
    R.head
)(Flowers.flowers);

// getSpeciesOfDevice :: String => String
const getSpeciesOfDevice = R.pipe(
    getFlowerConfiguration,
    R.prop("species")
);

// getFlowerFromDb :: String => Flower
const getFlowerFromDb = species => R.pipe(
    R.filter(R.propEq("pid", species)),
    R.head,
)(plantDb);

// getMinSoilMoisture :: String => Number
const getMinSoilMoisture = R.pipe(
    getFlowerFromDb,
    R.prop("min_soil_moist")
);

// getMinFertility :: String => Number
const getMinFertility= R.pipe(
    getFlowerFromDb,
    R.prop("min_soil_ec")
);

// irrigationRequired :: Msg => bool
const irrigationRequired = msg => {
    const device = R.view(Lenses.inputNameLens, msg);
    const flower = getSpeciesOfDevice(device);
    const minSoilMoisture = getMinSoilMoisture(flower);
    const actualSoilMoisture = R.prop("soil_moisture", R.view(Lenses.inputDataLens, msg));

    return minSoilMoisture > actualSoilMoisture;
};

// fertilizationRequired :: Msg => bool
const fertilizationRequired = msg => {
    const device = R.view(Lenses.inputNameLens, msg);
    const flower = getSpeciesOfDevice(device);
    const minFertility = getMinFertility(flower);
    const actualFertility = R.prop("fertility", R.view(Lenses.inputDataLens, msg));

    return minFertility > actualFertility;
};

// handleEachDeviceInANewStream :: obs => Stream[obs]
const handleEachDeviceInANewStream = Util.groupBy(R.view(Lenses.inputNameLens));

const createFlowerEvent = id => msg => {
    const device = R.view(Lenses.inputNameLens, msg);
    const flower = getFlowerConfiguration(device);
    return Events.createEvent(flower, id)(msg);
};

// createIrrigationRequiredEvent :: Msg => IrrigationRequired
const createIrrigationRequiredEvent = createFlowerEvent("IrrigationRequired");

// creatFertilizationRequiredEvent :: Msg => FertilizationRequired
const creatFertilizationRequiredEvent = createFlowerEvent("FertilizationRequired");

const input = new Kefir.pool();

const plantSensorStream = input
    .filter(isPlantSensor);

const plantFertilityStream = plantSensorStream
    .filter(isFertilityMessage);

const plantSoilMoistureStream = plantSensorStream
    .filter(isSoilMoistureMessage);

const observeIrrigation = flowerStream => flowerStream
    .filter(irrigationRequired)
    .map(createIrrigationRequiredEvent);

const observeFertilization = flowerStream => flowerStream
    .filter(fertilizationRequired)
    .map(creatFertilizationRequiredEvent);

const flowerNeedsIrrigationStream = plantSoilMoistureStream
    .thru(handleEachDeviceInANewStream)
    .flatMap(observeIrrigation)
    .thru(Util.throttleOncePerDay);

const flowerNeedsFertilizationStream = plantFertilityStream
    .thru(handleEachDeviceInANewStream)
    .flatMap(observeFertilization)
    .thru(Util.throttleOncePerDay);

const output = Kefir.merge([flowerNeedsFertilizationStream, flowerNeedsIrrigationStream]);

module.exports = {
    input,
    output
};
