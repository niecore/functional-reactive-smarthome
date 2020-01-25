const R = require('ramda');
const Scenes = require('../config/scenes.json');
const Remotes = require('../config/remotes');
const Routes = require('../router');
const Devices = require('../model/devices');
const Lenses = require('../lenses');

// knownRemotes
const knownRemotes = Remotes;

// getRemoteByName :: String => Remotes | undefined
const getRemoteByName = R.prop(R.__, knownRemotes);

// knownScenes
const knownScenes = Scenes;

// getSceneByName :: String => Scene | undefined
const getSceneByName = R.prop(R.__, knownScenes);

// isMessageFromRemoteSensor :: Msg => Boolean
const isMessageFromRemoteSensor = R.pipe(
    R.view(Lenses.inputNameLens),
    Devices.deviceHasType("remote")
);

// isMessageFromConfiguredRemote :: Msg => Boolean
const isMessageFromConfiguredRemote = R.pipe(
    R.view(Lenses.inputNameLens),
    R.includes(R.__, R.keys(Remotes))
);

// isSceneSelect :: Scene => Msg => Boolean
const sceneIsActive = input => scene => {
    return R.reduce(R.and, true)(R.values(R.mapObjIndexed(
        (num, key, obj) => R.whereEq(num)(R.propOr({}, key)(input))
    )(scene)));
};

const getScenesRemoteConfiguration = input => {
    const remote = getRemoteByName(R.view(Lenses.inputNameLens)(input));
    const action = R.prop("action")(R.view(Lenses.inputDataLens)(input));
    const click = R.prop("click")(R.view(Lenses.inputDataLens)(input));

    const scenes = R.prop(R.defaultTo(action)(click), remote);

    return scenes;
};

const selectSceneFromArray = scenes => input => {
    if(R.equals(1, R.length(scenes))){
        return R.head(scenes)
    }

    const active_scene_index = R.findIndex(sceneIsActive(R.view(Lenses.stateLens, input)), scenes);

    if(active_scene_index != -1){
        return R.nth(R.modulo(active_scene_index + 1, R.length(scenes)))(scenes);
    }else {
        return R.head(scenes);
    }

};

const getNextScene = input => {
    const remote = getScenesRemoteConfiguration(input);
    const scenes = R.map(getSceneByName)(remote);
    const selected = selectSceneFromArray(scenes)(input);

    return selected;
};

const remoteAction = Routes.input
    .filter(isMessageFromRemoteSensor)
    .filter(isMessageFromConfiguredRemote)
    .map(getNextScene);

Routes.output.plug(remoteAction);

module.exports = {
    getSceneByName,
};
