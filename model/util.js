const R = require('ramda');
const T = require("transducers-js");
const Kefir = require("kefir");
const schedule = require('node-schedule');

// convertToArray :: {a:A} => [{key:a, value: A}]
const convertToArray = R.pipe(R.toPairs, R.map(R.zipObj(['key', 'value'])));

// convertFromArray :: [{key:a, value: A}] => {a:A}
const convertFromArray = R.pipe(R.map(R.values), R.fromPairs);

const currentValue = property =>  {
    var result;
    var save = function(x) {
        result = x;
    };
    property.onValue(save);
    property.offValue(save);
    return result;
};

const groupBy = (keyF, limitF = (stream, _) => stream ) => src => {
    const streams = {};

    return src.transduce(T.comp(
        T.filter((x) => !streams[keyF(x)]),
        T.map(function (firstValue) {
            const key = keyF(firstValue);
            const similarValues = src.changes().filter(x => keyF(x) === key);
            const data = Kefir.constant(firstValue).concat(similarValues);

            const limited = limitF(data, firstValue).withHandler((emitter, event) => {
                if (event.type === 'end') {
                    delete streams[key];
                    emitter.end();
                } else {
                    emitter.emit(event.value);
                }
            });

            streams[key] = limited;
            return limited;
        })
    ))
};

const schedulerStream = value => cron => Kefir.stream(emitter => {
    schedule.scheduleJob(cron, () => {
        emitter.emit(value);
    });
});


module.exports = {
    convertToArray,
    convertFromArray,
    groupBy,
    schedulerStream,
    currentValue
};
