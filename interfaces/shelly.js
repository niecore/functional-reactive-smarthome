const Bacon = require("baconjs");
const R = require('ramda');
const RA = require('ramda-adjunct');
const Interfaces = require('../config/interfaces.json');
const Mqtt = require("mqtt");
const MqttStream = require("../interfaces/mqtt_stream");

// baseTopic :: String
const baseTopic = Interfaces.shelly.baseTopic;

// baseTopic :: String
const address = Interfaces.shelly.address;

const client = Mqtt.connect(address);
client.subscribe(R.map(prependBaseTopic, R.keys(zigbeeDevices)));
client.subscribe(baseTopic + "/bridge/log");

const deviceInputStream = MqttStream.inputStream(client)
    .map(R.over(topicLense, removeBaseTopic))
    .map(R.over(payloadLense, R.toString));

module.exports = {
    deviceInputStream,
    deviceOutputStream,
};
