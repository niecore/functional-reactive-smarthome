const R = require('ramda');

// convertToArray :: {a:A} => [{key:a, value: A}]
const convertToArray = R.pipe(R.toPairs, R.map(R.zipObj(['key', 'value'])));

// convertFromArray :: [{key:a, value: A}] => {a:A}
const convertFromArray = R.pipe(R.map(R.values), R.fromPairs);

module.exports = {
    convertToArray,
    convertFromArray,
};
