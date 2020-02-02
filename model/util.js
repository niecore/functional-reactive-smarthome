const R = require('ramda');

// convertToOutput :: {a:A} => [{key:a, value: A}]
const convertToArray = R.pipe(R.toPairs, R.map(R.zipObj(['key', 'value'])));

module.exports = {
    convertToArray,
};
