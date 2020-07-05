const Mqtt = require("mqtt");
const MqttStream = require("./mqttStream");
const Kefir = require("kefir");
const R = require('ramda');
const RA = require('ramda-adjunct');
const Devices = require('../model/devices');
const Interfaces = require('../../config/interfaces.json');
const Util = require('../util');

// baseTopic :: String
const baseTopic = Interfaces.ble.baseTopic;

// baseTopic :: String
const address = Interfaces.ble.address;

// isBleDevice :: Device -> bool
const isBleDevice = R.propEq("interface", "ble");

// bleDevices :: [Device]
const bleDevices = R.pickBy(isBleDevice, Devices.knownDevices);

// openMqttGatewayDeviceTopic :: String => String
const openMqttGatewayDeviceTopic = device => baseTopic + "/+/BTtoMQTT/" + R.prop("id", Devices.getDeviceByName(device));

// getDeviceNameFromBleId :: String => String
const getDeviceNameFromBleId = id => R.head(R.keys(R.filter(R.propEq("id", id), bleDevices)));

// openMqttGatewayDeviceTopic :: String => String
const getDeviceFromMqttTopic = topic => getDeviceNameFromBleId(topic.split("/")[3]);

// isMiFloraModel :: MqttMessage => Boolean
const isMiFloraModel = R.pipe(
    R.view(MqttStream.payloadLense),
    R.propEq("model", "HHCCJCY01HHCC")
);

// processMiFloraData :: MqttMessage => MqttMessage
const processMiFloraData = mqttMsg => {
    const translation = {
        "tem": "temperature",
        "fer": "fertility",
        "lux": "illuminance_lux",
        "moi": "soil_moisture"
    };

    const filterPayload = R.pick(R.keys(translation));
    const renameKeys = RA.renameKeys(translation);

    const payload = R.pipe(
        filterPayload,
        renameKeys
    )(mqttMsg.payload);

    return {topic: mqttMsg.topic, payload: payload};
};

const client = Mqtt.connect(address);

client.subscribe(R.map(openMqttGatewayDeviceTopic, R.keys(bleDevices)));

const inputStream = MqttStream.inputStream(client)
    .map(MqttStream.parsePayloadAsJson)
    .map(R.over(MqttStream.topicLense, getDeviceFromMqttTopic));

const miFloraStream = inputStream
    .filter(isMiFloraModel)
    .map(processMiFloraData)
    .map(obj => R.objOf(obj.topic)(obj.payload));

const deviceInputStream = Kefir.merge([miFloraStream]);

const deviceOutputStream = new Kefir.pool();

module.exports = {
    deviceInputStream,
    deviceOutputStream
};
