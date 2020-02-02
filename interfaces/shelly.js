const Bacon = require("baconjs");
const R = require('ramda');
const RA = require('ramda-adjunct');
const Interfaces = require('../config/interfaces.json');
const Mqtt = require("mqtt");
const MqttStream = require("../interfaces/mqtt_stream");
const Devices = require('../model/devices');
const Util = require('../model/util');

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

const getDeviceByTopic = topic => R.pipe(
    R.filter(R.propEq("interface", "shelly")),
    R.filter(R.propSatisfies(R.startsWith(R.__, topic),"id")),
    R.keys,
    R.head
)(Devices.knownDevices);

const brightnessScalingIn =  input => input * 255 / 100;
const brightnessScalingOut =  input => input * 100 / 255;

const fromShellyData = data => {
    const device_name = getDeviceByTopic(data.topic);
    const device = Devices.getDeviceByName(device_name);
    const typeOfDevice = R.prop("type", device);
    const sub_topic = R.replace(device.id, "", data.topic);

    if(typeOfDevice === "light"){
        if(sub_topic === "") {
            return {topic: device_name, payload: {state: data.payload.toUpperCase()}};
        } else if (sub_topic === "/status") {
            return {topic: device_name, payload: {brightness: brightnessScalingIn(R.prop("brightness", JSON.parse(data.payload)))}};
        } else if (sub_topic === "/power") {
            return {topic: device_name, payload: {power: JSON.parse(data.payload)}};
        } else if (sub_topic === "/energy") {
            return {topic: device_name, payload: {energy: JSON.parse(data.payload)}};
        } else {
            return {};
        }
    }

    if(typeOfDevice === "remote"){
        if(sub_topic === "") {
            return {topic: device_name, payload: {action: data.payload === "1"? "ON": "OFF"}};
        } else {
            return {};
        }
    }
};

const toShellyData = data => {
    const device = Devices.getDeviceByName(data.key);
    const typeOfDevice = R.prop("type", device);

    if(typeOfDevice === "light") {
        const payload = R.pipe(
            R.pick(["state", "brightness"]),
            R.over(R.lensProp("brightness"), brightnessScalingOut),
            R.over(R.lensProp("state"), R.toLower),
            RA.renameKeys({state: 'turn'})
        )(data.value);

        return {topic: device.id + "/set", payload: payload}
    }

    return data;
};

const client = Mqtt.connect(address);
client.subscribe(shellyTopics);
const deviceInputStream = MqttStream.inputStream(client)
    .map(R.over(MqttStream.topicLense, R.replace(baseTopic + "/", "")))
    .map(R.over(MqttStream.payloadLense, R.toString))
    .filter(input => !input.topic.endsWith("/set"))
    .map(fromShellyData)
    .map(obj => R.objOf(obj.topic)(obj.payload));

const deviceOutputStream = new Bacon.Bus();

deviceOutputStream
    .map(Util.convertToArray)
    .map(R.map(toShellyData))
    .map(R.map(R.over(MqttStream.topicLense, topic => baseTopic + "/" + topic)))
    .map(R.map(R.over(MqttStream.payloadLense, JSON.stringify)))
    .onValue(array => array.forEach(input =>
            MqttStream.publishTopic(client)(input.topic)(input.payload)
        )
    );

module.exports = {
    deviceInputStream,
    deviceOutputStream,
};