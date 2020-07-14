const R = require('ramda');
const Kefir = require('kefir');

const Remotes = require('../model/remotes');
const Events = require("../events/events");

const isSwitchToNextSceneEvent = Events.isEvent( "NextSceneClick");
const isSwitchToPreviousSceneEvent = Events.isEvent( "PreviousSceneClick");
const isSceneSwitchingEvent = R.anyPass([isSwitchToNextSceneEvent, isSwitchToPreviousSceneEvent]);

let currentSceneOfRemotes = {};

// createStartSceneEvent :: scene => StartScene
const createStartSceneEvent = scene => Events.createEvent({scene:scene}, "StartScene");

const getNextScene = sceneSwitchEvent => {

    const sceneNamesFromRemote = Remotes.getScenesOfRemote(sceneSwitchEvent.remote);
    const currentSceneOfRemote = R.propOr(0, sceneSwitchEvent.remote, currentSceneOfRemotes);

    const [scene, new_index] = switchSceneForward(sceneNamesFromRemote)(currentSceneOfRemote);

    currentSceneOfRemotes = R.assoc(sceneSwitchEvent.remote, new_index, currentSceneOfRemote);

    return createStartSceneEvent(scene)(Events.getState(sceneSwitchEvent));
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
