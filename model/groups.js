const R = require('ramda');
const Groups = require('../config/groups.json');
const Rooms = require('../model/rooms.js');
const Devices = require('../model/devices.js');

// usergroups :: [Group]
const userGroups = Groups.groups;

// createGroupOfDevices :: String -> [Device] -> [Group]
const createGroupOfDevices = name => R.pipe(
    R.map(R.prop("name")),
    R.map(R.of),
    R.map(R.objOf("devices")),
    R.reduce(R.mergeWith(R.concat), []),
    R.assoc("name", name)
);

// nameLense :: Lens s a
const nameLense = R.lensProp("name");

// devicesLense :: Lens s a
const devicesLense = R.lensProp("devices");

// groupPrefix :: String => String
const groupPrefix = R.concat("group_");

// roomGroup :: String -> [Group]
const roomGroup = room => R.of(createGroupOfDevices(groupPrefix(room))(Rooms.getDevicesInRoom(room))); // todo: beautify

// typeGroup :: String -> [Group]
const typeGroup = type => R.of(createGroupOfDevices(groupPrefix(type))(Devices.getDevicesOfType(type))); // todo: beautify

// typeGroupName :: String => String
const roomTypeGroupName = (room, type) => type + "_in_" + room;

// roomGroupOfType :: String, String -> [Group]
const roomGroupOfType = (room, type) => roomGroup(room)
    .map(R.over(devicesLense, R.filter(Devices.deviceHasType(type))))
    .map(R.over(nameLense, R.always(groupPrefix(roomTypeGroupName(room, type)))));