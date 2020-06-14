const R = require('ramda');
const Remotes = require('../../config/remotes');
const Lenses = require('../lenses');

// knownRemotes
const knownRemotes = Remotes;

// getRemoteByName :: String => Remotes | undefined
const getRemoteByName = R.prop(R.__, knownRemotes);

// getScenesOfRemote :: String => [String]
const getScenesOfRemote = R.pipe(
    getRemoteByName,
    R.prop("scenes"),
);

module.exports = {
    knownRemotes,
    getRemoteByName,
    getScenesOfRemote
};
