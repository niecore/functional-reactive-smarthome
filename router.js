// Devices
const Zigbee = require('./interfaces/zigbee');
const Shelly = require('./interfaces/shelly');
const EasyControl = require('./interfaces/easy_control');
const XiaomiScale = require('./interfaces/xiaomi_scale');
const Tasmota = require('./interfaces/tasmota');

// Model
const Devices = require("./model/devices");
const Groups = require("./model/groups");

// Automations
const MotionLight = require('./automations/motionLight.js');
const Alarm = require('./automations/alarm.js');
const SceneSwitching = require('./automations/sceneControl.js');
const BrightnessControl = require('./automations/brightnessControl.js');
const InfluxDb = require('./automations/influxdbLogger');
const Presence = require('./model/presence');

const Hub = require("./hub");

// Plug interfaces input to hub
Hub.update.plug(Zigbee.deviceInputStream);
Hub.update.plug(Shelly.deviceInputStream);
Hub.update.plug(XiaomiScale.deviceInputStream);
Hub.update.plug(Tasmota.deviceInputStream);

EasyControl.deviceInputStream.then(function (stream) {
    Hub.update.plug(stream)
});

// Plug hub to automations
BrightnessControl.input.plug(Hub.input);
SceneSwitching.input.plug(Hub.input);
MotionLight.input.plug(Hub.input);
InfluxDb.input.plug(Hub.input);
Presence.input.plug(Hub.input);

// Plug automations to output
Hub.output.plug(BrightnessControl.output);
Hub.output.plug(SceneSwitching.output);
Hub.output.plug(MotionLight.output);
Hub.output.plug(Alarm.output);

// Plug hub output to interfaces
const devices = Hub.output.map( Groups.filterMsgIsDevice);
const groups = Hub.output.map(Groups.filterMsgIsGroup);

Zigbee.deviceOutputStream.plug(devices.map(Devices.filterMsgByDeviceInterface("zigbee")));
Zigbee.groupOutputStream.plug(groups);

Shelly.deviceOutputStream.plug(devices.map(Devices.filterMsgByDeviceInterface("shelly")));
Shelly.groupOutputStream.plug(groups);

Tasmota.deviceOutputStream.plug(devices.map(Devices.filterMsgByDeviceInterface("tasmota")));
Tasmota.groupOutputStream.plug(groups);
