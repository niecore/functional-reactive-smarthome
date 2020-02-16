const Bacon = require("baconjs");
const R = require('ramda');
const Interfaces = require('../config/interfaces.json');
const Mqtt = require("mqtt");
const MqttStream = require("../interfaces/mqtt_stream");

// baseTopic :: String
const topic = Interfaces.miscale.baseTopic + "/weight/kg";

// baseTopic :: String
const address = Interfaces.miscale.address;

const client = Mqtt.connect(address);
client.subscribe(topic);
const deviceInputStream = MqttStream.inputStream(client)
    .map(data => R.objOf("miscale")({weight: JSON.parse(data.payload)}))
    .skipDuplicates(R.equals);

const deviceOutputStream = new Bacon.Bus();

module.exports = {
    deviceInputStream,
    deviceOutputStream,
};
