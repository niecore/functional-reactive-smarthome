const R = require("ramda");
const Kefir = require("kefir");

const Scenes = require("../scenes");

const isStartSceneEvent = R.propEq("id", "StartScene");
const input = new Kefir.pool();

const output = input
    .filter(isStartSceneEvent)
    .flatMapLatest(startSceneEvent => {
        const scene = Scenes.getSceneByName(startSceneEvent.scene);

        if(Scenes.isSwitchedScene(scene)) {
            return Scenes.switchedSceneStream(scene)
        } else {
            return Kefir.constant(scene)
        }
    });

module.exports = {
    input,
    output
};


