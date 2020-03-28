const Kefir = require("kefir");
const R = require('ramda');
const Lenses = require('../lenses');
const Devices = require('../model/devices');
const Remotes = require('../model/remotes');
const Logic = require('../model/logic');

// isMessageFromRemoteSensor :: Msg => Boolean
const isMessageFromRemoteSensor = R.pipe(
    R.view(Lenses.inputNameLens),
    Devices.deviceHasType("remote")
);

// isMessageWithBrightnessAdjustment :: Msg => Boolean
const isMessageWithBrightnessAdjustment = R.pipe(
    Remotes.getRemoteAction,
    R.includes(R.__, ["brightness_up_click", "brightness_down_click"])
);

const adjustBrightnessInRoom = input => {

    const factor =  Remotes.getRemoteAction(input) == "brightness_up_click" ? 50 : -50;

    const other_devices = R.pipe(
        Logic.getStateOfDeviceInSameRoom,
        R.pickBy((k, v) => Devices.deviceHasType("light")(v)),
        R.map(R.pick(["brightness"])),
        R.map(R.map(R.add(factor))),
        R.map(R.map(R.max(0))),
        R.map(R.map(R.min(255))),
    )(input);

    return other_devices;
};

const input = new Kefir.pool();

const output = input
    .filter(Devices.isMessageFromDevice)
    .filter(isMessageFromRemoteSensor)
    .filter(isMessageWithBrightnessAdjustment)
    .map(adjustBrightnessInRoom);

module.exports = {
    input,
    output
};

