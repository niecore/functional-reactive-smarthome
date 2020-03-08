const Mqtt = require("mqtt");
const MqttStream = require("../interfaces/mqtt_stream");
const Bacon = require("baconjs");
const R = require('ramda');
const RA = require('ramda-adjunct');
const Devices = require('../model/devices');
const Interfaces = require('../config/interfaces.json');
const Util = require('../model/util');

// baseTopic :: String
const baseTopic = Interfaces.zigbee.baseTopic;

// baseTopic :: String
const address = Interfaces.zigbee.address;

// isZigbeeDevice :: Device -> bool
const isZigbeeDevice = R.propEq("interface", "zigbee");

// zigbeeDevices :: [Device]
const zigbeeDevices = R.pickBy(isZigbeeDevice, Devices.knownDevices);

// isKnownDevice :: String -> bool
const isKnownDevice = R.includes(R.__, R.keys(zigbeeDevices));

// prependBaseTopic :: String -> String
const prependBaseTopic = R.concat(baseTopic + "/");

// prependSetTopic :: String -> String
const appendSetTopic = R.concat(R.__, "/set");

// removeBaseTopic :: String -> String
const removeBaseTopic = R.replace(baseTopic + "/", "");

// isLogTopic :: String -> bool
const isLogTopic = R.endsWith("bridge/log");

// isLogMessage ::  Message -> bool
const isLogMessage = R.propSatisfies(isLogTopic, "topic");

// createGroupTopic :: String
const createGroupTopic = baseTopic + "/bridge/config/add_group";

// removeFromAllGroupsTopic :: String
const removeFromAllGroupsTopic = baseTopic + "/bridge/group/remove_all";

// addDeviceToGroupTopic :: String -> String
const addToGroupTopic = deviceName => baseTopic + "/bridge/group/" + deviceName + "/add";

// removeFromGroupTopic :: String -> String
const removeFromGroupTopic = deviceName => baseTopic + "/bridge/group/" + deviceName + "/remove";

const client = Mqtt.connect(address);
client.subscribe(R.map(prependBaseTopic, R.keys(zigbeeDevices)));
client.subscribe(baseTopic + "/bridge/log");

const deviceInputStream = MqttStream.inputStream(client)
    .map(R.over(MqttStream.topicLense, removeBaseTopic))
    .map(R.over(MqttStream.payloadLense, R.toString))
    .map(R.over(MqttStream.payloadLense, JSON.parse))
    .filter(msg => isKnownDevice(msg.topic))
    .map(obj => R.objOf(obj.topic)(obj.payload));

const deviceOutputStream = new Bacon.Bus();
const groupOutputStream = new Bacon.Bus();

deviceOutputStream.plug(groupOutputStream);

deviceOutputStream
    .map(Util.convertToArray)
    .map(R.map(RA.renameKeys({key: 'topic', value: 'payload'})))
    .map(R.map(R.over(MqttStream.topicLense, R.pipe(prependBaseTopic, appendSetTopic))))
    .map(R.map(R.over(MqttStream.payloadLense, JSON.stringify)))
    .onValue(array => array.forEach(input =>
            MqttStream.publishTopic(client)(input.topic)(input.payload)
        )
    );

module.exports = {
    deviceInputStream,
    deviceOutputStream,
    groupOutputStream
};
