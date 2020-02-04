const R = require('ramda');
const Routes = require('../router');
const Devices = require('../model/devices');
const Remotes = require('../model/remotes');
const Scenes = require('../model/scenes');
const Lenses = require('../lenses');

// isMessageFromRemoteSensor :: Msg => Boolean
const isMessageFromRemoteSensor = R.pipe(
    R.view(Lenses.inputNameLens),
    Devices.deviceHasType("remote")
);

// isMessageFromConfiguredRemote :: Msg => Boolean
const isMessageFromConfiguredRemote = R.pipe(
    R.view(Lenses.inputNameLens),
    Remotes.getRemoteByName,
    R.isNil,
    R.not
);

const getNextScene = input => {
    const scenesFromRemote = R.pipe(
        Remotes.getSceneNamesFromRemoteAction,
        R.map(Scenes.getSceneByName)
    )(input);

    const defaultScene = R.head(scenesFromRemote);
    const active_scene_index = R.findIndex(Scenes.sceneIsActive(R.view(Lenses.stateLens, input)), scenesFromRemote);

    if(active_scene_index != -1){
        return R.nth(R.modulo(active_scene_index + 1, R.length(scenesFromRemote)))(scenesFromRemote);
    }else {
        return defaultScene;
    }
};

const remoteAction = Routes.input
    .filter(isMessageFromRemoteSensor)
    .filter(isMessageFromConfiguredRemote)
    .map(getNextScene);

Routes.output.plug(remoteAction);
