const R = require('ramda');
const Scenes = require('../config/scenes.json');
const Lenses = require('../lenses');

// knownScenes
const knownScenes = Scenes;

// getSceneByName :: String => Scene | undefined
const getSceneByName = R.prop(R.__, knownScenes);

// isSceneSelect :: Scene => Msg => Boolean
const sceneIsActive = input => scene => {
    return R.reduce(R.and, true)(R.values(R.mapObjIndexed(
        (num, key, obj) => R.whereEq(num)(R.propOr({}, key)(input))
    )(scene)));
};

module.exports = {
    knownScenes,
    getSceneByName,
    sceneIsActive
};
