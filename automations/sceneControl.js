const R = require('ramda');
const Hub = require('../hub');
const Lenses = require('../lenses');
const Devices = require('../model/devices');
const Remotes = require('../model/remotes');
const Scenes = require('../model/scenes');

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
    const sceneNamesFromRemote = Remotes.getSceneNamesFromRemoteAction(input);

    if(R.isNil(sceneNamesFromRemote)){
        return {}
    }

    const scenesFromRemote = R.map(Scenes.getSceneByName, sceneNamesFromRemote);

    const defaultScene = R.head(scenesFromRemote);
    const active_scene_index = R.findIndex(Scenes.sceneIsActive(R.view(Lenses.stateLens, input)), scenesFromRemote);

    if(active_scene_index != -1){
        return R.nth(R.modulo(active_scene_index + 1, R.length(scenesFromRemote)))(scenesFromRemote);
    }else {
        return defaultScene;
    }
};

const remoteAction = Hub.input
    .filter(Devices.isMessageFromDevice)
    .filter(isMessageFromRemoteSensor)
    .filter(isMessageFromConfiguredRemote)
    .map(getNextScene);

module.exports = {
    remoteAction
};
