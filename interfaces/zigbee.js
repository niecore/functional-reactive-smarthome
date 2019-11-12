const Bacon = require("baconjs");
const Mqtt = require("mqtt");
const R = require('ramda');
const Devices = require('../config/devices.json');
const Interfaces = require('../config/interfaces.json');
const RenameKeys = require('../util/renameKeys');

// baseTopic :: String
const baseTopic = Interfaces.zigbee.baseTopic;

// baseTopic :: String
const address = Interfaces.zigbee.address;

// knownDevices :: [Device]
const knownDevices = Devices.devices;

// getName :: Device -> String
const getName = R.prop('name');

// prependBaseTopic :: String -> String
const prependBaseTopic = R.concat(baseTopic + "/");

// prependSetTopic :: String -> String
const appendSetTopic = R.concat(R.__, "/set");

// removeBaseTopic :: String -> String
const removeBaseTopic = R.replace(baseTopic + "/", "");

// deviceTopic :: Device -> String
const deviceTopic = R.compose(prependBaseTopic, getName);

// isKnownDevice :: String -> bool
const isKnownDevice = R.includes(R.__, knownDevices.map(getName));

// topicLense :: Lens s a
const topicLense = R.lensProp("topic");

// payloadLense :: Lens s a
const payloadLense = R.lensProp("payload");

// renameToDeviceStream :: Message -> DeviceState
const deviceStreamRenaming = RenameKeys.renameKeys({topic: "device", payload: "state"});
const mqttStreamRenaming = RenameKeys.renameKeys({device: "topic", state: "payload"});

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
    .map(deviceStreamRenaming);

const deviceOutputStream = new Bacon.Bus();

deviceOutputStream
    .map(mqttStreamRenaming)
    .map(R.over(topicLense, R.pipe(prependBaseTopic, appendSetTopic)))
    .map(R.over(payloadLense, JSON.stringify))
    .onValue(input =>
        client.publish(input.topic, input.payload)
    );

exports.deviceInputStream = deviceInputStream;
exports.deviceOutputStream = deviceOutputStream;