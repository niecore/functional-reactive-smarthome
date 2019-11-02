const bacon = require("baconjs")
const mqtt = require("mqtt")
const {matches} = require('z')
const {getSunrise, getSunset} = require('sunrise-sunset-js')

const config = {
    services: {
        mqtt: {
            address: "mqtt://192.168.0.158"
        }
    },
    baseTopic: "zigbee2mqtt"
}

const client = mqtt.connect(config.services.mqtt.address)

// todo change to map
let devices = [
    {name: "motionsensor_aqara_1", type: "motion_sensor", room: "junk_room"},
    {name: "motionsensor_aqara_2", type: "motion_sensor", room: "unused"},
    {name: "motionsensor_aqara_3", type: "motion_sensor", room: "staircase"},
    {name: "motionsensor_aqara_4", type: "motion_sensor", room: "staircase"},
    {name: "motionsensor_aqara_5", type: "motion_sensor", room: "staircase"},
    {name: "lightbulb_huew_1", type: "light", room: "junk_room"},
    {name: "lightbulb_tradfriw_1", type: "light", room: "staircase"},
    {name: "lightbulb_tradfriw_2", type: "light", room: "staircase"},
    {name: "lightbulb_tradfriw_3", type: "light", room: "staircase"},
    {name: "lightbulb_tradfriw_4", type: "light", room: "staircase"},
]

let rooms = [
    {name: "front_door", motion_light: {enabled: false, adaptiveBrigthness: false}},
    {name: "hallway", motion_light: {enabled: false, adaptiveBrigthness: false}},
    {name: "server_room", motion_light: {enabled: false, adaptiveBrigthness: false}},
    {name: "bathroom_small", motion_light: {enabled: false, adaptiveBrigthness: false}},
    {name: "kitchen", motion_light: {enabled: false, adaptiveBrigthness: false}},
    {name: "living_room", motion_light: {enabled: false, adaptiveBrigthness: false}},
    {name: "junk_room", motion_light: {enabled: true, adaptiveBrigthness: false}},
    {name: "garden", motion_light: {enabled: false, adaptiveBrigthness: false}},
    {name: "staircase", motion_light: {enabled: true, adaptiveBrigthness: true}},
    {name: "office", motion_light: {enabled: false, adaptiveBrigthness: false}},
    {name: "bathroom", motion_light: {enabled: false, adaptiveBrigthness: false}},
    {name: "bedroom", motion_light: {enabled: false, adaptiveBrigthness: false}},
    {name: "laundry_room", motion_light: {enabled: false, adaptiveBrigthness: false}},
]

let getRoomFromDevice = device => rooms.filter(room => room.name = device.room)

let motionLightEnabled = room => room.motion_light.enabled
let motionLightAdaptiveBrightness = room => room.motion_light.adaptiveBrigthness

let deviceHasType = type => device => device.type === type
let deviceIsInRoom = room => device => device.room === room.name

let getDevice = deviceName => devices.filter(device => device.name === deviceName)
let getDevicesInRoom = roomName => devices.filter(deviceIsInRoom(roomName))
let getDevicesOfType = deviceType => devices.filter(deviceHasType(deviceType))
let getPropertyOfMessage = property => message => message.payload[property]

let getLightsInRoom = room => getDevicesInRoom(room)
    .filter(deviceHasType("light"))

let getRoomsWithEnabledAdaptiveBrightness = rooms
    .filter(motionLightAdaptiveBrightness)

let getRoomsWithEnabledMotionLight = rooms
    .filter(motionLightEnabled)

let inRoom = room => message => getDevice(message.name)
    .some(deviceIsInRoom(room))

let isDeviceType = deviceType => message => getDevice(message.name)
    .some(deviceHasType(deviceType))

let setLight = (enable, brightness) => device => {
    client.publish(config.baseTopic + "/" + device.name + "/set", '{"state": "' + (enable ? "on" : "off") + '","brightness": ' + brightness + "}", qos = 1)
}

let setLightsInRoom = room => enable =>  {
    let brigthness = matches(motionLightAdaptiveBrightness(room)) (
        (x = true) => adaptiveBrigthness(),
        (x = false) => 255
    )
    getLightsInRoom(room)
        .forEach(setLight(enable, brigthness))
}

let occupancyDetected = message => getPropertyOfMessage("occupancy")(message)
let illuminance = message => getPropertyOfMessage("illuminance")(message)

let mqttTopic = device => config.baseTopic + "/" + device.name

let devicesStream = bacon.fromBinder(function (sink) {
    client.on('message', function (topic, message) {
        sink({name: topic.replace(config.baseTopic + "/", ""), payload: JSON.parse(message.toString())})
    })
})

let roomStream = room => devicesStream
    .filter(inRoom(room))

let roomOccupancy = room => roomStream(room)
    .filter(isDeviceType("motion_sensor"))
    .filter(occupancyDetected)
    .map(true)

let roomIlluminance = room => roomStream(room)
    .filter(isDeviceType("motion_sensor"))
    .map(illuminance)

let roomMovementLightTrigger = room => roomOccupancy(room)
    .flatMapLatest(
        () => bacon.once(true).merge(bacon.later(90000, false))
    )

let timeInNightTime = date => (getSunrise(50.6, 8.7) > date || date > getSunset(50.6, 8.7))
let timeInSleepTime = date => timeInNightTime(date) && date.getHours() < 10
let timeInDayTime = date => !timeInNightTime(date)
let dayTime = () => timeInDayTime(new Date())
let sleepTime = () => timeInSleepTime(new Date())

let evaluateDayPhase = () => {
    if(dayTime()) return "dayTime"
    if(sleepTime()) return "sleepTime"
    return "nightTime"
}

let adaptiveBrigthness = () => {
    return matches(evaluateDayPhase()) (
        (x = "dayTime") => 0,
        (x = "nightTime") => 255,
        (x = "sleepTime") => 5
    )
}

getRoomsWithEnabledMotionLight.forEach(room => {
        roomMovementLightTrigger(room)
            .onValue(setLightsInRoom(room))
    }
)

client.subscribe(devices.map(mqttTopic))


console.log("Starting functional-reactive-smart-home.")