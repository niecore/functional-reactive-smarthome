const R = require("ramda");
const Kefir = require("kefir");
const Scenes = require("../model/scenes");
const Automations = require("../config/automations.json");
const schedule = require('node-schedule');

const schedulerStream = value => cron => Kefir.stream(emitter => {
    schedule.scheduleJob(cron, () => {
        emitter.emit(value);
    });
});

const input = new Kefir.pool();

const ambientLight = Kefir.sequentially(0, Automations.automations.ambientLight)
    .flatMap(ambientLight => {
        return Kefir.merge([
            schedulerStream(true)(ambientLight.trigger),
            schedulerStream(false)(ambientLight.stop)
        ]).flatMapLatest(enable => enable
            ? Scenes.switchedSceneStream(Scenes.getSceneByName(ambientLight.scene))
            : Kefir.constant(Scenes.getSceneByName(ambientLight.disable))
        )
    });

const output = input.merge(ambientLight);

module.exports = {
    output,input
};
