const R = require("ramda");
const Kefir = require("kefir");
const Scenes = require("../model/scenes");
const Automations = require("../config/automations.json");
const Util = require("../model/util");

const input = new Kefir.pool();

const ambientLight = Kefir.sequentially(0, Automations.automations.ambientLight)
    .flatMap(ambientLight => {
        return Kefir.merge([
            Util.schedulerStream(true)(ambientLight.trigger),
            Util.schedulerStream(false)(ambientLight.stop)
        ]).flatMapLatest(enable => enable
            ? Scenes.switchedSceneStream(Scenes.getSceneByName(ambientLight.scene))
            : Kefir.constant(Scenes.getSceneByName(ambientLight.disable))
        )
    });

const output = input.merge(ambientLight);

module.exports = {
    output,input
};
