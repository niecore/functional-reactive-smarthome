const bacon = require("baconjs");
const mqtt = require("mqtt");
const notfication = require("./notifications");
const {matches} = require('z');
const {getSunrise, getSunset} = require('sunrise-sunset-js');


let setLight = (enable, brightness) => device => {
    client.publish(baseTopic + "/" + device + "/set", '{"state": "' + (enable ? "on" : "off") + '", "brightness": ' + brightness + "}", qos = 1)
};

let setLightsInRoom = room => enable => {
    setLight(enable, adaptiveBrigthness())(room.name + "_" + "light")
};

let occupancyDetected = message => getPropertyOfMessage("occupancy")(message);
let illuminance = message => getPropertyOfMessage("illuminance")(message);
let humidity = message => getPropertyOfMessage("humidity")(message);

let roomStream = room => devicesStream
    .filter(inRoom(room));

let roomOccupancy = room => roomStream(room)
    .filter(isDeviceType("motion_sensor"))
    .filter(occupancyDetected)
    .map(true);

let roomIlluminance = room => roomStream(room)
    .filter(isDeviceType("motion_sensor"))
    .map(illuminance);

let roomHumidity = room => roomStream(room)
    .filter(isDeviceType("air_sensor"))
    .map(humidity);

let roomMovementLightTrigger = room => roomOccupancy(room)
    .flatMapLatest(
        () => bacon.once(true).merge(bacon.later(automations.motionLight.delay, false))
    );

let timeInNightTime = date => (getSunrise(50.6, 8.7) > date || date > getSunset(50.6, 8.7));
let timeInSleepTime = date => timeInNightTime(date) && date.getHours() < 10;
let timeInDayTime = date => !timeInNightTime(date);
let dayTime = () => timeInDayTime(new Date());
let sleepTime = () => timeInSleepTime(new Date());

let evaluateDayPhase = () => {
    if (dayTime()) return "dayTime";
    if (sleepTime()) return "sleepTime";
    return "nightTime"
};

let adaptiveBrigthness = () => {
    return matches(evaluateDayPhase())(
        (x = "dayTime") => 0,
        (x = "nightTime") => 255,
        (x = "sleepTime") => 1
    )
};

automations.motionLight.rooms.forEach(room => {
        roomMovementLightTrigger(room)
            .onValue(setLightsInRoom(room))
    }
);

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


bacon.fromArray(devices)
    .filter(isDeviceType("light"))
    .bufferingThrottle(2000)
    .doAction(removeDeviceFromAllGroups)
    .bufferingThrottle(200)
    .doAction(createGroupForDevice)
    .bufferingThrottle(200)
    .doAction(addDeviceToRoomGroup)
    .subscribe();


