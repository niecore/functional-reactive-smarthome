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
    const action = getRemoteAction(input);
    const scenes = R.prop(action,remote);
    return scenes;
};

const getRemoteAction = input => {
    const action = R.prop("action")(R.view(Lenses.inputDataLens)(input));
    const click = R.prop("click")(R.view(Lenses.inputDataLens)(input));

    return R.defaultTo(action)(click);
};

module.exports = {
    knownRemotes,
    getRemoteByName,
    getRemoteAction,
    getSceneNamesFromRemoteAction,
};