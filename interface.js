const bacon = require("baconjs");
const mqtt = require("mqtt");
const notfication = require("./notifications");
const {matches} = require('z');
const {getSunrise, getSunset} = require('sunrise-sunset-js');

const address = "mqtt://192.168.0.158";
const baseTopic = "zigbee2mqtt";
const client = mqtt.connect(address);

let getMqttTopic = device => baseTopic + "/" + device.name;
let isPublishError = msg => msg.payload.type === "zigbee_publish_error";
let friendlyDeviceName = msg => msg.payload.meta.entity.friendlyName;
let knownDeviceMessage = msg => devices.map(device => device.name).includes(msg.name);
let logMessage = msg => msg.name.startsWith("bridge/log");

let mqttStream = bacon.fromBinder(function (sink) {
    client.on('message', function (topic, message) {
        sink({name: topic.replace(baseTopic + "/", ""), payload: JSON.parse(message.toString())})
    })
});

let logStream = mqttStream
    .filter(logMessage);

let devicesStream = mqttStream
    .filter(knownDeviceMessage);

const devices = [
    {name: "motionsensor_aqara_1", type: "motion_sensor", room: "junk_room", description: ""},
    {name: "motionsensor_aqara_2", type: "motion_sensor", room: "unused", description: ""},
    {name: "motionsensor_aqara_3", type: "motion_sensor", room: "staircase", description: ""},
    {name: "motionsensor_aqara_4", type: "motion_sensor", room: "staircase", description: ""},
    {name: "motionsensor_aqara_5", type: "motion_sensor", room: "staircase", description: ""},
    {name: "lightbulb_huew_1", type: "light", room: "junk_room", description: "Lampe in Speisekammer"},
    {name: "lightbulb_tradfriw_1", type: "light", room: "staircase", description: "Hängelampe Flur (Mitte)"},
    {name: "lightbulb_tradfriw_2", type: "light", room: "staircase", description: "Hängelampe Flur (Oben)"},
    {name: "lightbulb_tradfriw_3", type: "light", room: "staircase", description: "Wandlampe Flur (Oben)"},
    {name: "lightbulb_tradfriw_4", type: "light", room: "staircase", description: "Wandlampe Flur (Mitte)"},
    {name: "sensor_air_1", type: "air_sensor", room: "laundry_room", description: ""},
];

const rooms = [
    {name: "front_door"},
    {name: "hallway"},
    {name: "server_room"},
    {name: "bathroom_small"},
    {name: "kitchen"},
    {name: "living_room"},
    {name: "junk_room"},
    {name: "garden"},
    {name: "staircase"},
    {name: "office"},
    {name: "bathroom"},
    {name: "bedroom"},
    {name: "laundry_room"},
];

const automations = {
    motionLight: {
        rooms: [
            {name: "junk_room"},
            {name: "staircase"},
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

let removeDeviceFromAllGroups = device => {
    client.publish(baseTopic + "/bridge/group/remove_all", device.name, qos = 1)
};

let createGroupForDevice = device => {
    client.publish(baseTopic + "/bridge/config/add_group", groupFromDevice(device), qos = 1)
};

let addDeviceToGroup = device => {
    client.publish(baseTopic + "/bridge/group/" + groupFromDevice(device) + "/add", device.name, qos = 1)
};

bacon.fromArray(devices)
    .filter(isDeviceType("light"))
    .bufferingThrottle(2000)
    .doAction(removeDeviceFromAllGroups)
    .doAction(createGroupForDevice)
    .doAction(addDeviceToGroup)
    .subscribe();


client.subscribe(devices.map(getMqttTopic));
client.subscribe(baseTopic + "/bridge/log");
logStream.log();

console.log("Starting functional-reactive-smart-home.");
