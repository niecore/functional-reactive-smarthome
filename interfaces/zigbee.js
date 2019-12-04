const Mqtt = require("mqtt");
const Bacon = require("baconjs");
const R = require('ramda');
const RA = require('ramda-adjunct');
const Devices = require('../model/devices');
const Groups = require('../model/groups');
const Interfaces = require('../config/interfaces.json');

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

// topicLense :: Lens s a
const topicLense = R.lensProp("topic");

// payloadLense :: Lens s a
const payloadLense = R.lensProp("payload");

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
    .filter(msg => isKnownDevice(msg.topic))
    .map(obj => R.objOf(obj.topic)(obj.payload));


const deviceOutputStream = new Bacon.Bus();

// convertToOutput :: {a:A} => [{key:a, value: A}]
const convertToArray = R.pipe(R.toPairs, R.map(R.zipObj(['key', 'value'])));

deviceOutputStream
    .map(convertToArray)
    .map(RA.renameKeys({ key: 'topic', value: 'payload'}))
    .map(R.over(topicLense, R.pipe(prependBaseTopic, appendSetTopic)))
    .map(R.over(payloadLense, JSON.stringify))
    .onValue(input =>
        publishTopic(input.topic, input.payload)
    );

const logStream = processedStream
    .filter(isLogMessage);


const publishTopic = topic => payload => new Promise((resolve) => client.publish(topic, payload, resolve));
const createGroup = publishTopic(createGroupTopic);
const addDeviceToGroup = group => device => publishTopic(addToGroupTopic(group))(device);
const removeDeviceFromGroup = group => device => publishTopic(removeFromGroupTopic(group))(device);
const removeDeviceFromAllGroups = device => publishTopic(removeFromAllGroupsTopic)(device);

const createGroups = R.pipe(
    convertToArray,
    R.map(RA.renameKeys({ key: 'name', value: 'payload'})),
    R.forEach(group =>
        createGroup(group.name)
            .then(
                R.forEach(
                    addDeviceToGroup(group.name)
                )(Groups.devicesInGroup(group.payload))
            )
    )
);

R.pipe(
    convertToArray,
    R.map(R.prop("key")),
    R.forEach(removeDeviceFromAllGroups)
)(zigbeeDevices);

module.exports = {
    deviceInputStream,
    deviceOutputStream,
    createGroups,
};
