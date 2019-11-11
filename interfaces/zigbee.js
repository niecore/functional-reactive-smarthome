const bacon = require("baconjs");
const mqtt = require("mqtt");
const Devices = require('../config/devices.json');
const R = require('ramda');
const address = "mqtt://192.168.0.158";
const baseTopic = "zigbee2mqtt";

const getName = R.prop('name');
const prependBaseTopic = R.concat(baseTopic + "/");
const removeBaseTopic = R.replace(baseTopic + "/", "");
const deviceTopic = R.compose(prependBaseTopic, getName);

let isLogMessage = R.compose(R.map(), getName);

const mqttStream = bacon.fromBinder(function (sink) {
    client.on('message', function (topic, message) {
        sink([topic, message])
    })
});

mqttStream
    .map(removeBaseTopic)
    .

const ZigbeeLogStream = mqttStream
    .filter(isLogMessage);

const ZigbeeDevicesStream = mqttStream
    .filter(!isLogMessage);

const client = mqtt.connect(address);
client.subscribe(Devices.devices.map(deviceTopic));
client.subscribe(baseTopic + "/bridge/log");
