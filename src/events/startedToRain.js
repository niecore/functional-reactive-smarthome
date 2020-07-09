const R = require("ramda");
const Kefir = require("kefir");

const Lenses = require('../lenses');
const Events = require("./events");

// currentRainAmountLens :: Lens
const currentRainAmountLens = R.compose(Lenses.inputDataLens, R.lensPath(["current", "rain"]));

// previousRainAmountLens :: Lens
const previousRainAmountLens = R.compose(Lenses.stateLens, R.lensPath(["weather","current", "rain"]));

// currentRainAmount :: Msg => Number
const currentRainAmount = R.view(currentRainAmountLens);

// previousRainAmount :: Msg => Number
const previousRainAmount = R.view(previousRainAmountLens);

// isWeatherMeasurement :: Msg => Boolean
const isWeatherMeasurement = R.pipe(
    R.view(Lenses.inputDataLens),
    R.hasPath(["current"])
);

// isItCurrentlyRaining :: Msg => Boolean
const isItCurrentlyRaining = R.pipe(
    currentRainAmount,
    R.lt(0)
);

// isItCurrentlyRaining :: Msg => Boolean
const isItCurrentlyNotRaining = R.complement(isItCurrentlyRaining);

// wasRainingBefore :: Msg => Boolean
const wasRainingBefore = R.pipe(
    previousRainAmount,
    R.lt(0)
);

// createStartedToRainEvent :: Msg => StartedToRain
const createStartedToRainEvent = Events.createBasicEvent("StartedToRain");

// createStoppedToRainEvent :: Msg => StoppedToRain
const createStoppedToRainEvent = Events.createBasicEvent("StoppedToRain");

const input = new Kefir.pool();

const weatherStream = input
    .filter(isWeatherMeasurement);

const rainStream = weatherStream
    .filter(isItCurrentlyRaining)
    .map(createStartedToRainEvent);

const noRainStream = weatherStream
    .filter(isItCurrentlyNotRaining)
    .filter(wasRainingBefore)
    .map(createStoppedToRainEvent);

const output = noRainStream.merge(rainStream)
    .skipDuplicates(Events.isSameEvent);

module.exports = {
    input,
    output
};


