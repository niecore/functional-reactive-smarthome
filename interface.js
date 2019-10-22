const bacon = require("baconjs")
const mqtt = require("mqtt")

const config = {
    services: {
        mqtt: {
            address: "mqtt://localhost"
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
    {name: "lightbulb_huew_1", type: "light", room: "junk_room"},
    {name: "lightbulb_tradfriw_1", type: "light", room: "staircase"},
    {name: "lightbulb_tradfriw_2", type: "light", room: "staircase"},
    {name: "lightbulb_tradfriw_3", type: "light", room: "staircase"},
    {name: "lightbulb_tradfriw_4", type: "light", room: "staircase"},
]

let rooms = [
    {name: "front_door", motion_light: {enabled: false}},
    {name: "hallway", motion_light: {enabled: false}},
    {name: "server_room", motion_light: {enabled: false}},
    {name: "bathroom_small", motion_light: {enabled: false}},
    {name: "kitchen", motion_light: {enabled: false}},
    {name: "living_room", motion_light: {enabled: false}},
    {name: "junk_room", motion_light: {enabled: false}},
    {name: "garden", motion_light: {enabled: false}},
    {name: "staircase", motion_light: {enabled: true}},
    {name: "office", motion_light: {enabled: false}},
    {name: "bathroom", motion_light: {enabled: false}},
    {name: "bedroom", motion_light: {enabled: false}},
    {name: "laundry_room", motion_light: {enabled: false}},
]

let motionLightEnabled = room => room.motion_light.enabled == true

let deviceHasType = type => device => device.type === type
let deviceIsInRoom = room => device => device.room === room

let getDevice = deviceName => devices.filter(device => device.name === deviceName)
let getDevicesInRoom = roomName => devices.filter(deviceIsInRoom(roomName))
let getDevicesOfType = deviceType => devices.filter(deviceHasType(deviceType))
let getPropertyOfMessage = property => message => message.payload[property]

let getLightsInRoom = room => getDevicesInRoom(room)
    .filter(deviceHasType("light"))

let getRoomsWithEnabledMotionLight = rooms
    .filter(motionLightEnabled)
    .map(room => room.name)

let inRoom = roomName => message => getDevice(message.name)
    .some(deviceIsInRoom(roomName))

let isDeviceType = deviceType => message => getDevice(message.name)
    .some(deviceHasType(deviceType))


let setLight = enable => device => {
    client.publish(config.baseTopic + "/" + device.name + "/set", '{"state": "' + (enable ? "on" : "off") + '"}', qos = 1)
}

let setLightsInRoom = room => enable => getLightsInRoom(room)
    .forEach(setLight(enable))

let occupancyDetected = message => getPropertyOfMessage("occupancy")(message)
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

let roomMovementLightTrigger = room => roomOccupancy(room)
    .flatMapLatest(
        () => bacon.once(true).merge(bacon.later(90000, false))
    )

getRoomsWithEnabledMotionLight.forEach(room => {
        roomMovementLightTrigger(room)
            .onValue(setLightsInRoom(room))
    }
)

client.subscribe(devices.map(mqttTopic))