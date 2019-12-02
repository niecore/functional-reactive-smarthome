const Bacon = require("baconjs");
const Zigbee = require('./interfaces/zigbee');
const RA = require('ramda-adjunct');

const Rooms = require('./model/rooms.js');
const Devices = require('./model/devices.js');
const Groups = require('./model/groups.js');

const deviceOutputStream = new Bacon.Bus();

deviceOutputStream.plug(
    Zigbee.deviceOutputStream)
;

const deviceInputStream = Bacon.mergeAll(
    Zigbee.deviceInputStream
);

module.exports = {
    deviceInputStream,
    deviceOutputStream,
};


// To be expanded for multiple interfaces
Zigbee.createGroups(
    RA.concatAll([
        Groups.roomGroupOfType("staircase", "light"), // to be created by automations
        Groups.knownGroups
    ])
);

console.log("Starting functional-reactive-smart-home.");