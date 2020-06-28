const R = require("ramda");
const Kefir = require("kefir");
const schedule = require('node-schedule');
const Interfaces = require("../../config/interfaces.json");

const weather = require('openweather-apis');
const token = "5b417aa6751be8d573b1222fb588696d";

weather.setCityId(Interfaces.weather.city);
weather.setAPPID(token);

const weatherForecastStream = Kefir.stream(function (emitter) {
        schedule.scheduleJob("*/5 * * * *", function () {
            weather.getWeatherForecast(function (err, obj) {
                emitter.emit(obj)
            })
        });
    });

const weatherCurrentStream = Kefir.stream(function (emitter) {
        schedule.scheduleJob("*/5 * * * *", function () {
            weather.getSmartJSON(function(err, obj){
                emitter.emit(obj)
            });
        });
    })
    .map(R.pick(["temp", "humidity", "pressure", "rain"]))
    .map(x => ({current: x}));

const getNext24hDataPoints = R.pipe(
    R.prop("list"),
    R.take(8),
);

const rainForecast24hStream = weatherForecastStream
    .map(getNext24hDataPoints)
    .map(R.map(R.pathOr(0, ["rain", "3h"])))
    .map(R.sum)
    .map(x => ({forecast: {rain: x}}));

const deviceInputStream = Kefir.merge([rainForecast24hStream, weatherCurrentStream])
    .map(R.objOf("weather"));

module.exports = {
    deviceInputStream
};
