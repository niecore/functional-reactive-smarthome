const Kefir = require("kefir");
const R = require('ramda');
const Interfaces = require('../config/interfaces.json');
const Devices = require('../model/devices');
const Util = require('../model/util');
const Mqtt = require("mqtt");
const MqttStream = require("../interfaces/mqtt_stream");

const tasmotaTopcis = R.pipe(
    R.filter(R.propEq("interface", "tasmota")),
    Util.convertToArray,
    R.map(d => d.key),
    R.map(name => `stat/${name}/POWER`)
)(Devices.knownDevices);

const client = Mqtt.connect(Interfaces.tasmota.address).subscribe(tasmotaTopcis);

const deviceInputStream = MqttStream.inputStream(client)
    .map(R.over(MqttStream.topicLense, s => s.replace("stat/", "").replace("/POWER", "")))
    .map(R.over(MqttStream.payloadLense, R.toString))
    .map(R.over(MqttStream.payloadLense, R.objOf("state")))
    .map(obj => R.objOf(obj.topic)(obj.payload));

const deviceOutputStream = new Kefir.pool();
const groupOutputStream = new Kefir.pool();

deviceOutputStream
    .map(Util.convertToArray)
    .map(R.map(R.over(MqttStream.payloadLense, JSON.stringify)))
    .onValue(array => array.forEach(input => {
            const topicPower = `cmnd/${input.key}/power`;
            MqttStream.publishTopic(client)(topicPower)(R.prop("state")(input.value))
        })
    );

module.exports = {
    deviceInputStream,
    deviceOutputStream,
    groupOutputStream
};
