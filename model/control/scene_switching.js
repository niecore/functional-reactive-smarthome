const R = require('ramda');
const Kefir = require('kefir');
const Remotes = require('../remotes');

const isSwitchToNextSceneEvent = R.propEq("id", "ButtonNextSceneClick");
const isSwitchToPreviousSceneEvent = R.propEq("id", "ButtonPreviousSceneClick");
const isSceneSwitchingEvent = R.anyPass([isSwitchToNextSceneEvent, isSwitchToPreviousSceneEvent]);

let currentSceneOfRemotes = {};

// createStartSceneEvent :: scene => StartScene
const createStartSceneEvent = scene => {
    return ({id: "StartScene", scene: scene});
};

const getNextScene = input => {

    const sceneNamesFromRemote = Remotes.getScenesOfRemote(input.remote);
    const currentSceneOfRemote = R.propOr(0, input.remote, currentSceneOfRemotes);

    const [scene, new_index] = switchSceneForward(sceneNamesFromRemote)(currentSceneOfRemote);

    currentSceneOfRemotes = R.assoc(input.remote, new_index, currentSceneOfRemote);

    return createStartSceneEvent(scene);
};

const switchSceneForward = scenes => index => {
    const new_index = R.modulo(index + 1, R.length(scenes));
    const scene = R.nth(index, scenes);

    return [scene, new_index];
};

const input = new Kefir.pool();

const output = input
    .filter(isSceneSwitchingEvent)
    .map(getNextScene);

module.exports = {
    input,
    output
};
