const Bacon = require("baconjs");
const R = require('ramda');
const Zigbee = require('./interfaces/zigbee');
const Shelly = require('./interfaces/shelly');
const EasyControl = require('./interfaces/easy_control');
const XiaomiScale = require('./interfaces/xiaomi_scale');
const Tasmota = require('./interfaces/tasmota');
const Util = require('./model/util');
const Devices = require("./model/devices");
const Groups = require("./model/groups");

const output = new Bacon.Bus();
const update = new Bacon.Bus();

update.plug(Zigbee.deviceInputStream);
update.plug(Shelly.deviceInputStream);
update.plug(XiaomiScale.deviceInputStream);
update.plug(Tasmota.deviceInputStream);

EasyControl.deviceInputStream.then(function (stream) {
    update.plug(stream)
});

const state = update.scan({}, R.mergeDeepRight);
const input = state.zip(update, (state, input) => [input, state]);

const devices = output.map(Groups.filterMsgIsDevice);
const groups = output.map(Groups.filterMsgIsGroup);


Zigbee.deviceOutputStream.plug(devices.map(Devices.filterMsgByDeviceInterface("zigbee")));
Zigbee.groupOutputStream.plug(groups);

Shelly.deviceOutputStream.plug(devices.map(Devices.filterMsgByDeviceInterface("shelly")));
Shelly.groupOutputStream.plug(groups);

Tasmota.deviceOutputStream.plug(devices.map(Devices.filterMsgByDeviceInterface("tasmota")));
Tasmota.groupOutputStream.plug(groups);

module.exports = {
    output,
    input
};