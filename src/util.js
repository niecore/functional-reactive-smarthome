const R = require('ramda');
const T = require("transducers-js");
const Kefir = require("kefir");
const schedule = require('node-schedule');

// convertToArray :: {a:A} => [{key:a, value: A}]
const convertToArray = R.pipe(R.toPairs, R.map(R.zipObj(['key', 'value'])));

// convertFromArray :: [{key:a, value: A}] => {a:A}
const convertFromArray = R.pipe(R.map(R.values), R.fromPairs);

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

const throttleOncePerDay = src => {
    let valueReceived = false;
    let secondsUntilEndOfDay = undefined;

    const getSecondsUntilEndOfDay = ()  => {
        const d = new Date();
        const h = d.getHours();
        const m = d.getMinutes();
        const s = d.getSeconds();
        return (24*60*60) - (h*60*60) - (m*60) - s;
    };

    const throttleEvent = src
        .filter(_ => valueReceived == false)
        .onValue(_ => {
            valueReceived = true;
            secondsUntilEndOfDay = getSecondsUntilEndOfDay();
        });

    throttleEvent
        .flatMap(_ => Kefir.later(secondsUntilEndOfDay * 1000, true))
        .onValue(_ => {
            valueReceived = false;
        });

    return throttleEvent
};

const debounce = R.curry((timeMs, fn) => {
    let timeout;

    return (...args) => {
        const later = () => {
            timeout = null;
            R.apply(fn, args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, timeMs);

        return timeout;
    };
});

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
    throttleOncePerDay,
    debounce
};
