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
    {name: "motionsensor_aqara_1", type: "motion_sensor", room: "staircase"},
    {name: "motionsensor_aqara_2", type: "motion_sensor", room: "staircase"},
    {name: "motionsensor_aqara_3", type: "motion_sensor", room: "staircase"},
    {name: "motionsensor_aqara_4", type: "motion_sensor", room: "staircase"},
    {name: "lightbulb_huew_1", type: "light", room: "staircase"},
]

let mqttTopic = device => config.baseTopic + "/" + device.name

let inRoom = (roomName) => {
    return (msg) => {
        return devices
            .filter(device => device.name === msg.name)
            .some(device => device.room === roomName)
    }
}

let getOccupancy = (msg) => msg.payload.occupancy

let isDeviceType = (type) => {
    return (msg) => {
        return devices
            .filter(device => device.name === msg.name)
            .some(device => device.type === type)
    }
}

let devicesStream = bacon.fromBinder(function (sink) {
    client.on('message', function (topic, message) {
        sink({name: topic.replace(config.baseTopic + "/", ""), payload: JSON.parse(message.toString())})
    })
})

let staircaseStream = devicesStream
    .filter(inRoom("staircase"))

let staircaseOccupancy = staircaseStream
    .filter(isDeviceType("motion_sensor"))
    .map(getOccupancy)
    .filter(Boolean)

staircaseOccupancy.onValue(msg => {
    devices
        .filter(inRoom("staircase"))
        .filter(isDeviceType("light"))
        .forEach(device => {
            client.publish(config.baseTopic + "/" + device.name + "/set", '{"state": on}')
        })

})

client.subscribe(devices.map(mqttTopic))