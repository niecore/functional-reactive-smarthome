const R = require('ramda');

const inputNameLens = R.lens(R.pipe(R.head, R.keys, R.head), R.identity);   // setter not implemented
const inputDataLens = R.lens(R.pipe(R.head, R.values, R.head), R.identity); // setter not implemented
const stateLens = R.lens(R.nth(1), R.identity);                             // setter not implemented

module.exports = {
    inputNameLens,
    inputDataLens,
    stateLens,
};
