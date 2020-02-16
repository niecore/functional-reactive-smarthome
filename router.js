const Bacon = require("baconjs");
const R = require('ramda');
const Zigbee = require('./interfaces/zigbee');
const Shelly = require('./interfaces/shelly');
const EasyControl = require('./interfaces/easy_control');
const XiaomiScale = require('./interfaces/xiaomi_scale');
const Devices = require("./model/devices");
const Util = require('./model/util');
const Groups = require("./model/groups");

const filterMsgByDeviceInterface = interfaceType => R.pipe(
    Util.convertToArray,
    R.filter(input => Devices.deviceHasInterface(interfaceType)(input.key)),
    Util.convertFromArray
);

const filterMsgIsGroup = R.pipe(
    Util.convertToArray,
    R.filter(input => Groups.isKnownGroup(input.key)),
    Util.convertFromArray
);

const filterMsgIsDevice = R.pipe(
    Util.convertToArray,
    R.filter(input => !Groups.isKnownGroup(input.key)),
    Util.convertFromArray
);


const output = new Bacon.Bus();
const update = new Bacon.Bus();

update.plug(Zigbee.deviceInputStream);
update.plug(Shelly.deviceInputStream);
update.plug(XiaomiScale.deviceInputStream);

EasyControl.deviceInputStream.then(function (stream) {
    update.plug(stream)
});


const state = update.scan({}, R.mergeDeepRight);
const input = state.zip(update, (state, input) => [input, state]);

const devices = output.map(filterMsgIsDevice);
const groups = output.map(filterMsgIsGroup);


Zigbee.deviceOutputStream.plug(devices.map(filterMsgByDeviceInterface("zigbee")));
Zigbee.deviceOutputStream.plug(groups); // currently only zigbee is handleing groups
Shelly.deviceOutputStream.plug(devices.map(filterMsgByDeviceInterface("shelly")));

module.exports = {
    output,
    input,
};