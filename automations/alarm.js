const R = require("ramda");
const Bacon = require('baconjs');

const Scenes = require('../model/scenes');
const Hub = require('../hub');
const schedule = require('node-schedule');

const weekday_rule = new schedule.RecurrenceRule(null, null, null, null, 6, 0, 0);

const alarmStream = Bacon.fromBinder(function (sink) {
    schedule.scheduleJob(weekday_rule, function(){
        sink({activate: true})
    });
});

const alarm = alarmStream
    .filter(R.prop("activate"))
    .map(Scenes.getSceneByName("wake_up_bed_room"))
    .map(R.head);

module.exports = {
    alarm
};
