// Devices
const Zigbee = require('./interfaces/zigbee');
const Shelly = require('./interfaces/shelly');
const EasyControl = require('./interfaces/easy_control');
const XiaomiScale = require('./interfaces/xiaomi_scale');
const Tasmota = require('./interfaces/tasmota');
const Hmip = require('./interfaces/hmip');

// Model
const Devices = require("./model/devices");
const Groups = require("./model/groups");

// Automations
const MotionLight = require('./model/automations/motionLight.js');

const Hub = require("./hub");

// Plug interfaces input to hub
Hub.update.plug(Zigbee.deviceInputStream);
Hub.update.plug(Shelly.deviceInputStream);
Hub.update.plug(XiaomiScale.deviceInputStream);
Hub.update.plug(Tasmota.deviceInputStream);
Hub.update.plug(Hmip.deviceInputStream);

EasyControl.deviceInputStream.then(function (stream) {
    Hub.update.plug(stream)
});

// Plug hub to automations
MotionLight.input.plug(Hub.input);

// Plug logics back to input
Hub.update.plug(Presence.output);

// Plug automations to output
Hub.output.plug(BrightnessControl.output);
Hub.output.plug(SceneSwitching.output);
Hub.output.plug(MotionLight.output);
Hub.output.plug(Alarm.output);
Hub.output.plug(AmbientLight.output);

// Plug hub output to interfaces
const devices = Hub.output.map(Groups.filterMsgIsDevice);
const groups = Hub.output.map(Groups.filterMsgIsGroup);

Zigbee.deviceOutputStream.plug(devices.map(Devices.filterMsgByDeviceInterface("zigbee")));
Zigbee.groupOutputStream.plug(groups);

Shelly.deviceOutputStream.plug(devices.map(Devices.filterMsgByDeviceInterface("shelly")));
Shelly.groupOutputStream.plug(groups);

Tasmota.deviceOutputStream.plug(devices.map(Devices.filterMsgByDeviceInterface("tasmota")));
Tasmota.groupOutputStream.plug(groups);
