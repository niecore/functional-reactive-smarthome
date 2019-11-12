const R = require('ramda');

exports.renameKeys = R.curry((keysMap, obj) =>
    R.reduce((acc, key) => R.assoc(keysMap[key] || key, obj[key], acc), {}, R.keys(obj))
);
