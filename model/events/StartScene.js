const R = require("ramda");
const Kefir = require("kefir");

const Scenes = require("../scenes");

const isStartSceneEvent = R.propEq("id", "StartScene");
const input = new Kefir.pool();

const output = input
    .filter(isStartSceneEvent)
    .map(startSceneEvent => {
        return Scenes.getSceneByName(startSceneEvent.scene)
    });

module.exports = {
    input,
    output
};


