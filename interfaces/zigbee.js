const Mqtt = require("mqtt");
const Bacon = require("baconjs");
const R = require('ramda');
const Devices = require('../config/devices.json');
const Interfaces = require('../config/interfaces.json');
const RenameKeys = require('../util/renameKeys');

// baseTopic :: String
const baseTopic = Interfaces.zigbee.baseTopic;

// baseTopic :: String
const address = Interfaces.zigbee.address;

// isZigbeeDevice :: Device -> bool
const isZigbeeDevice = R.propEq("interface", "zigbee");

// knownDevices :: [Device]
const knownDevices = Devices.devices.filter(isZigbeeDevice);

// getName :: Device -> String
const getName = R.prop('name');

// isKnownDevice :: String -> bool
const isKnownDevice = R.includes(R.__, knownDevices.map(getName));

// prependBaseTopic :: String -> String
const prependBaseTopic = R.concat(baseTopic + "/");

// prependSetTopic :: String -> String
const appendSetTopic = R.concat(R.__, "/set");

// removeBaseTopic :: String -> String
const removeBaseTopic = R.replace(baseTopic + "/", "");

// deviceTopic :: Device -> String
const deviceTopic = R.compose(prependBaseTopic, getName);

// topicLense :: Lens s a
const topicLense = R.lensProp("topic");

// payloadLense :: Lens s a
const payloadLense = R.lensProp("payload");

// renameToDeviceStream :: Message -> DeviceState
const renameToDeviceStream = RenameKeys.renameKeys({topic: "device", payload: "state"});

// renameToMqttStream :: DeviceState -> Message
const renameToMqttStream = RenameKeys.renameKeys({device: "topic", state: "payload"});

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
client.subscribe(knownDevices.map(deviceTopic));
client.subscribe(baseTopic + "/bridge/log");

const rawStream = Bacon.fromBinder(function (sink) {
    client.on('message', function (topic, message) {
        sink({topic: topic, payload: message})
    })
});

const processedStream = rawStream
    .map(R.over(topicLense, removeBaseTopic))
    .map(R.over(payloadLense, R.toString))
    .map(R.over(payloadLense, JSON.parse));


const deviceInputStream = processedStream
    .filter(!isKnownDevice(R.view(topicLense)))
    .map(renameToDeviceStream);

const deviceOutputStream = new Bacon.Bus();

deviceOutputStream
    .map(renameToMqttStream)
    .map(R.over(topicLense, R.pipe(prependBaseTopic, appendSetTopic)))
    .map(R.over(payloadLense, JSON.stringify))
    .map(R.props("topic", "payload"))
    .onValue(input =>
        publishTopic(input.topic, input.payload)
    );

const logStream = processedStream
    .filter(isLogMessage);

const publishTopic = topic => payload => new Promise((resolve) => client.publish(topic, payload, resolve));
const createGroup = publishTopic(createGroupTopic);
const addDeviceToGroup = group => device => publishTopic(addToGroupTopic(group), device);
const removeDeviceFromGroup = group => device => publishTopic(removeFromGroupTopic(group), device);
const removeDeviceFromAllGroups = device => publishTopic(removeFromAllGroupsTopic, device);

const createGroups = R.pipe(
    R.identity,
    /*removeDevicesFromGroups,
    createGroups,
    addDevicesToGroups*/
);

module.exports = {
    deviceInputStream,
    deviceOutputStream,
    createGroups,
};
