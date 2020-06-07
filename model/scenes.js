const R = require('ramda');
const Kefir = require('kefir');
const Scenes = require('../config/scenes.json');
const Rooms = require('../model/rooms');
const Lenses = require('./lenses');

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

// filterSceneByDevicesInRoom :: String => Scene => Scene
const filterSceneByDevicesInRoom = room => R.pipe(
    R.pickBy((_, device) => Rooms.deviceIsInRoom(room)(device))
);

const switchedSceneStream = scene => {
    return Kefir.repeat(_ => {
        return Kefir.stream(emitter => {
            scene.forEach(element => {
                const delay = element[0];
                const scene = element[1];
                emitter.emit(Kefir.later(delay * 1000, scene))
            });
            emitter.end()
        }).flatMap();
    });
};

module.exports = {
    knownScenes,
    getSceneByName,
    sceneIsActive,
    filterSceneByDevicesInRoom,
    switchedSceneStream
};
