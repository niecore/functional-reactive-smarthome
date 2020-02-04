const R = require('ramda');
const Remotes = require('../config/remotes');
const Lenses = require('../lenses');

// knownRemotes
const knownRemotes = Remotes;

// getRemoteByName :: String => Remotes | undefined
const getRemoteByName = R.prop(R.__, knownRemotes);

// getSceneNamesFromRemoteAction
const getSceneNamesFromRemoteAction = input => {
    const remote = getRemoteByName(R.view(Lenses.inputNameLens)(input));
    const action = R.prop("action")(R.view(Lenses.inputDataLens)(input));
    const click = R.prop("click")(R.view(Lenses.inputDataLens)(input));

    const scenes = R.prop(R.defaultTo(action)(click),remote);

    return scenes;
};

module.exports = {
    knownRemotes,
    getRemoteByName,
    getSceneNamesFromRemoteAction,
};