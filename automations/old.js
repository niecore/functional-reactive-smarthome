const bacon = require("baconjs");
const mqtt = require("mqtt");
const notfication = require("./notifications");
const {matches} = require('z');


automations.thresholdAlarms.forEach(alarm => {
    roomStream(alarm.room)
        .map(getPropertyOfMessage(alarm.property))
        .flatMapLatest(value =>
            bacon.later(alarm.delay, {value: value, trigger: alarm.limits.min > value || value > alarm.limits.max})
        )
        .filter(_ => _.trigger)
        .map(_ => `Threshold alarm in room ${alarm.room.name}: ${alarm.property} is ${_.value.toString()}`)
        .doAction(notfication.sendMessage)
        .subscribe()
});

unreachableDeviceStream = logStream
    .filter(isPublishError)
    .map(friendlyDeviceName)
    .map(getDevice)
    .map(device => `Unreachable device: ${device.description} ${device.name}`)
    .doAction(notfication.sendMessage)
    .subscribe();


