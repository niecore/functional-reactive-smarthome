const R = require("ramda");
const Kefir = require("kefir");

const Events = require("../events/events");
const Devices = require("../model/devices");
const Lenses = require("../lenses");

const input = new Kefir.pool();

const deviceWentOffline = Events.isEvent("DeviceOffline");

const sendDeviceOfflineNotifcation = deviceOfflineEvent => {
    const device = deviceOfflineEvent.device;
    const description = Devices.getDescriptionOfDevice(device);

    return Events.createEvent({message: device + " '" + description + "'" + " went offline"}, "NotifyUser")(R.view(Lenses.stateLens, deviceOfflineEvent));
};

const output = input
    .filter(deviceWentOffline)
    .map(sendDeviceOfflineNotifcation);

module.exports = {
    input,
    output
};
