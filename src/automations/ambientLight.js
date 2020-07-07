const R = require("ramda");
const Kefir = require("kefir");

const Automations = require("../../config/automations.json");
const Util = require("../util");
const Events = require("../events/events");

const input = new Kefir.pool();

// createStartSceneEvent :: scene => StartScene
const createStartSceneEvent = scene => Events.createEvent({scene: scene}, "StartScene", Events.emptyState);

// createStopSceneEvent :: scene => StopScene
const createStopSceneEvent = scene => Events.createEvent({scene: scene}, "StopScene", Events.emptyState);

const createStartSceneStream = scene => Kefir.constant(createStartSceneEvent(scene));
const createStopSceneStream = scene => Kefir.constant(createStopSceneEvent(scene));

const ambientLight = Kefir.sequentially(0, Automations.automations.ambientLight)
    .flatMap(ambientLight => {
        return Kefir.merge([
            Util.schedulerStream(true)(ambientLight.trigger),
            Util.schedulerStream(false)(ambientLight.stop)
        ]).flatMap(enable => enable
            ? createStartSceneStream(ambientLight.scene)
            : createStopSceneStream(ambientLight.scene).merge(createStartSceneStream(ambientLight.disable))
        )
    });

const output = ambientLight;

module.exports = {
    output,
    input
};
