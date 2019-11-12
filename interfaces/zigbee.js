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

const topicLense = R.lensProp("topic");
const payloadLense = R.lensProp("payload");

let isLogTopic = x.startsWith("bridge/log");

const client = mqtt.connect(address);
client.subscribe(Devices.devices.map(deviceTopic));
client.subscribe(baseTopic + "/bridge/log");

const rawStream = bacon.fromBinder(function (sink) {
    client.on('message', function (topic, message) {
        sink({topic: topic, payload: message})
    })
});

rawStream
    .map(R.over(topicLense, removeBaseTopic))
    .map(R.over(payloadLense, R.toString))
    .map(R.over(payloadLense, JSON.parse))

const deviceStream = rawStream
    .filter(R.over(topicLense), )