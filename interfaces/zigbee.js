const Mqtt = require("mqtt");
const Bacon = require("baconjs");
const R = require('ramda');
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

// getDeviceName :: Device -> String
const getDeviceName = R.prop('name');

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
    .map(R.over(payloadLense, JSON.parse))

const deviceInputStream = processedStream
    .filter(!isKnownDevice(R.view(topicLense)))
    .map(obj => R.objOf(obj.topic)(obj.payload));


const deviceOutputStream = new Bacon.Bus();

const transform = R.pipe(
    R.toPairs,
    R.map(obj => {
            return {
                topic: obj[0],
                payload: obj[1]
            }
        }
    )
);

deviceOutputStream
    .map(transform)
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

const createGroups = R.forEach(group =>
    createGroup(group.name)
        .then(
            R.forEach(
                addDeviceToGroup(group.name)
            )(Groups.devicesInGroup(group))
        )
);

R.forEach(
    removeDeviceFromAllGroups
)(R.map(getDeviceName, zigbeeDevices));


logStream.doLog().subscribe();

module.exports = {
    deviceInputStream,
    deviceOutputStream,
    createGroups,
};
