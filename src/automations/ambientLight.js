const R = require("ramda");
const Kefir = require("kefir");
const Automations = require("../../config/automations.json");
const Util = require("../util");

const input = new Kefir.pool();

// createStartSceneEvent :: scene => StartScene
const createStartSceneEvent = scene => {
    return ({id: "StartScene", scene: scene});
};

const ambientLight = Kefir.sequentially(0, Automations.automations.ambientLight)
    .flatMap(ambientLight => {
        return Kefir.merge([
            Util.schedulerStream(true)(ambientLight.trigger),
            Util.schedulerStream(false)(ambientLight.stop)
        ]).map(enable => enable
            ? createStartSceneEvent(ambientLight.scene)
            : createStartSceneEvent(ambientLight.disable)
        )
    });

const output = input.merge(ambientLight);

module.exports = {
    output,
    input
};
