const Kefir = require("kefir");
const R = require('ramda');
const RA = require('ramda-adjunct');
const Interfaces = require('../../config/interfaces.json');
const Mqtt = require("mqtt");
const MqttStream = require("./mqttStream");
const Devices = require('../model/devices');
const Util = require('../util');
const Groups = require("../model/groups");

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

const brightnessScalingIn =  input => RA.round(input * 255 / 100);
const brightnessScalingOut =  input => RA.round(input * 100 / 255);

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

    if(typeOfDevice === "relay"){
        if(sub_topic === "") {
            return {topic: device_name, payload: {state: R.toUpper(data.payload)}};
        } else {
            return {};
        }
    }
};

const toShellyData = data => {
    const device = Devices.getDeviceByName(data.key);
    const typeOfDevice = R.prop("type", device);

    if(typeOfDevice === "light") {
        const adaptBrightness = R.ifElse(
            R.has("brightness"),
            R.pipe(
                R.pick(["brightness"]),
                R.over(R.lensProp("brightness"), brightnessScalingOut),
                R.over(R.lensProp("brightness"), R.max(1)), // brightness of "0" is not allowed
                R.over(R.lensProp("brightness"), R.min(255)), // brightness larger "255" is not allowed
            ),
            R.always({})
        )(data.value);

        const adaptState = R.ifElse(
            R.has("state"),
            R.pipe(
                R.pick(["state"]),
                R.over(R.lensProp("state"), R.toLower),
                RA.renameKeys({state: 'turn'})
            ),
            R.always({})
        )(data.value);

        return {topic: device.id + "/set", payload: JSON.stringify(R.mergeLeft(adaptState, adaptBrightness))}
    }

    if(typeOfDevice === "relay") {
        const adaptState = R.ifElse(
            R.has("state"),
            R.pipe(
                R.prop("state"),
                R.toLower
            ),
            R.always({})
        )(data.value);

        return {topic: device.id + "/command", payload: adaptState}
    }

    return data;
};

const client = Mqtt.connect(address);
client.subscribe(shellyTopics);
const deviceInputStream = MqttStream.inputStream(client)
    .map(R.over(MqttStream.topicLense, R.replace(baseTopic + "/", "")))
    .map(R.over(MqttStream.payloadLense, R.toString))
    .filter(input => !input.topic.endsWith("/set"))
    .filter(input => !input.topic.endsWith("/command"))
    .map(fromShellyData)
    .map(obj => R.objOf(obj.topic)(obj.payload));

const deviceOutputStream = new Kefir.pool();
const groupOutputStream = new Kefir.pool();

const expanededGroupStream = groupOutputStream
    .map(Groups.expandGroupMsg)
    .map(Devices.filterMsgByDeviceInterface("shelly"));

deviceOutputStream.plug(expanededGroupStream);

deviceOutputStream
    .map(Util.convertToArray)
    .map(R.map(toShellyData))
    .map(R.map(R.over(MqttStream.topicLense, topic => baseTopic + "/" + topic)))
    .onValue(array => array.forEach(input =>
            MqttStream.publishTopic(client)(input.topic)(input.payload)
        )
    );

module.exports = {
    deviceInputStream,
    deviceOutputStream,
    groupOutputStream
};
