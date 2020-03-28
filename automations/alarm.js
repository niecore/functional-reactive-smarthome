const R = require("ramda");
const Kefir = require('kefir');

const Scenes = require('../model/scenes');
const schedule = require('node-schedule');

const weekday_rule = new schedule.RecurrenceRule(null, null, null, null, 6, 0, 0);

const alarmStream = Kefir.stream(function (sink) {
    schedule.scheduleJob(weekday_rule, function(){
        sink({activate: true})
    });
});

const output = alarmStream
    .filter(R.prop("activate"))
    .map(Scenes.getSceneByName("wake_up_bed_room"))
    .map(R.head);

module.exports = {
    output
};
