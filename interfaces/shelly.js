const Bacon = require("baconjs");
const R = require('ramda');
const RA = require('ramda-adjunct');
const Interfaces = require('../config/interfaces.json');
const Mqtt = require("mqtt");
const MqttStream = require("../interfaces/mqtt_stream");
const Devices = require('../model/devices');

// baseTopic :: String
const baseTopic = Interfaces.shelly.baseTopic;

// baseTopic :: String
const address = Interfaces.shelly.address;

const shellyTopics = R.pipe(
    R.filter(R.propEq("interface", "shelly")),
    R.map(R.prop("id")),
    R.values,
    R.map(R.concat(baseTopic + "/")),
    R.map(topic => topic + "/#")
)(Devices.knownDevices);

const client = Mqtt.connect(address);
client.subscribe(shellyTopics);

const getDeviceByTopic = topic => R.pipe(
    R.filter(R.propEq("interface", "shelly")),
    R.filter(R.propSatisfies(R.startsWith(R.__, topic),"id")),
    R.keys,
    R.head
)(Devices.knownDevices);


const transformData = data => {
    const device_name = getDeviceByTopic(data.topic);
    const device = Devices.getDeviceByName(device_name);
    const typeOfDevice = R.prop("type", device);
    const sub_topic = R.replace(device.id, "", data.topic);

    if(typeOfDevice === "light"){
        if(sub_topic === "") {
            return {topic: device_name, payload: {state: data.payload.toUpperCase()}};
        } else if (sub_topic === "/status") {
            return {topic: device_name, payload: {brightness: R.prop("brightness", JSON.parse(data.payload))}};
        } else if (sub_topic === "/power") {
            return {topic: device_name, payload: {power: JSON.parse(data.payload)}};
        } else if (sub_topic === "/energy") {
            return {topic: device_name, payload: {energy: JSON.parse(data.payload)}};
        } else {
            return {topic: device_name, payload: {}};
        }
    }

    if(typeOfDevice === "remote"){
        if(sub_topic === "") {
            return {topic: device_name, payload: {action: data.payload === "1"? "ON": "OFF"}};
        } else {
            return {topic: device_name, payload: {}};
        }
    }
};


const deviceInputStream = MqttStream.inputStream(client)
    .map(R.over(MqttStream.topicLense, R.replace(baseTopic + "/", "")))
    .map(R.over(MqttStream.payloadLense, R.toString))
    .map(transformData);


deviceInputStream.doLog().subscribe();

const deviceOutputStream = new Bacon.Bus();

module.exports = {
    deviceInputStream,
    deviceOutputStream,
};
