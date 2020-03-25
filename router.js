// Devices
const Zigbee = require('./interfaces/zigbee');
const Shelly = require('./interfaces/shelly');
const EasyControl = require('./interfaces/easy_control');
const XiaomiScale = require('./interfaces/xiaomi_scale');
const Tasmota = require('./interfaces/tasmota');

// Model
const Devices = require("./model/devices");
const Groups = require("./model/groups");

const MotionLight = require('./automations/motionLight.js');
const Alarm = require('./automations/alarm.js');
const SceneSwitching = require('./automations/sceneControl.js');
const BrightnessControl = require('./automations/brightnessControl.js');
const InfluxDb = require('./automations/influxdbLogger');
const Presence = require('./model/presence');


const Hub = require("./hub");

Hub.output.plug(BrightnessControl.brightnessControl);
Hub.output.plug(SceneSwitching.remoteAction);
Hub.output.plug(MotionLight.motionLight);
Hub.output.plug(Alarm.alarm);

Hub.update.plug(Zigbee.deviceInputStream);
Hub.update.plug(Shelly.deviceInputStream);
Hub.update.plug(XiaomiScale.deviceInputStream);
Hub.update.plug(Tasmota.deviceInputStream);

EasyControl.deviceInputStream.then(function (stream) {
    Hub.update.plug(stream)
});

const devices = Hub.output.map(Groups.filterMsgIsDevice);
const groups = Hub.output.map(Groups.filterMsgIsGroup);


Zigbee.deviceOutputStream.plug(devices.map(Devices.filterMsgByDeviceInterface("zigbee")));
Zigbee.groupOutputStream.plug(groups);

Shelly.deviceOutputStream.plug(devices.map(Devices.filterMsgByDeviceInterface("shelly")));
Shelly.groupOutputStream.plug(groups);

Tasmota.deviceOutputStream.plug(devices.map(Devices.filterMsgByDeviceInterface("tasmota")));
Tasmota.groupOutputStream.plug(groups);

