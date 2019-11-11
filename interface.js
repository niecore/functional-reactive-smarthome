const bacon = require("baconjs");
const mqtt = require("mqtt");
const notfication = require("./notifications");
const {matches} = require('z');
const {getSunrise, getSunset} = require('sunrise-sunset-js');
const R = require('ramda');



const automations = {
    motionLight: {
        rooms: [
            {name: "junk_room"},
            {name: "staircase", includeNight: ["lightbulb_tradfriw_1", "lightbulb_tradfriw_2"]},
        ],
        delay: 3 * 1000
    },
    thresholdAlarms: [
        {room: {name: "laundry_room"}, property: "humidity", limits: {max: 65}, delay: 600 * 1000}
    ]
};

let getRoomFromDevice = device => rooms.filter(room => room.name = device.room);
let motionLightEnabled = room => automations.motionLight.rooms.map(room => room.name).includes(room.name);

let deviceHasType = type => device => device.type === type;
let deviceIsInRoom = room => device => device.room === room.name;

let getDevice = deviceName => devices.find(device => device.name === deviceName);
let getDevicesInRoom = roomName => devices.filter(deviceIsInRoom(roomName));
let getDevicesOfType = deviceType => devices.filter(deviceHasType(deviceType));
let getPropertyOfMessage = property => message => message.payload[property];

let getLightsInRoom = room => getDevicesInRoom(room)
    .filter(deviceHasType("light"));

let getRoomsWithEnabledMotionLight = rooms
    .filter(motionLightEnabled);

let inRoom = room => message => deviceIsInRoom(room)(getDevice(message.name));
let isDeviceType = deviceType => message => deviceHasType(deviceType)(getDevice(message.name));

let setLight = (enable, brightness) => device => {
    client.publish(baseTopic + "/" + device + "/set", '{"state": "' + (enable ? "on" : "off") + '","brightness": ' + brightness + "}", qos = 1)
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
        (x = "sleepTime") => 5
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

let groupFromDevice = device => device.room + "_" + device.type;
let deviceRoomGroup = device => device.room + "_" + device.type;
let deviceNightLightGroup = device => device.room + "_" + device.type + "_nightlight";

let removeDeviceFromAllGroups = device => client.publish(baseTopic + "/bridge/group/remove_all", device.name, qos = 1);
let createGroup = name => client.publish(baseTopic + "/bridge/config/add_group", name, qos = 1);
let addDeviceToGroup = name => device => client.publish(baseTopic + "/bridge/group/" + name + "/add", device.name, qos = 1);


let createGroupForDevice = device => createGroup(deviceRoomGroup(device));
let addDeviceToRoomGroup = device => addDeviceToGroup(deviceRoomGroup(device))(device);
let createNightGroupForDevice = device => createGroup(deviceNightLightGroup(device));
let addDeviceToNightLightGroup = device => addDeviceToGroup(deviceNightLightGroup(device))(device);

bacon.fromArray(devices)
    .filter(isDeviceType("light"))
    .bufferingThrottle(2000)
    .doAction(removeDeviceFromAllGroups)
    .delay(1000)
    .doAction(createGroupForDevice)
    .delay(1000)
    .doAction(addDeviceToGroup)
    //.subscribe();


let createGroupForDeviceList = name => list => list.forEach(addDeviceToRoomGroup(name));

let excludedFromNightLight = room => bacon.fromArray(automations.motionLight.rooms)
    .map(R.prop("name"))
    .map(getDevicesInRoom)

bacon.fromArray(automations.motionLight.rooms)
    .map(getDevicesInRoom)
    .doAction(devicelist => createGroupForDeviceList(devicelist[0].room.name + "_motion_light_group"))
    .subscribe();



logStream.log();


excludedFromNightLight("staircase").log()


console.log("Starting functional-reactive-smart-home.");
