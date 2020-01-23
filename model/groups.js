const R = require('ramda');
const Groups = require('../config/groups.json');
const Rooms = require('../model/rooms.js');
const Devices = require('../model/devices.js');

// knownGroups :: [Group]
const knownGroups = Groups.groups;

// createGroupOfDevices :: String -> [String] -> [Group]
const createGroupOfDevices = name =>  R.pipe(
    R.objOf("devices"),
    R.objOf(name)
);

// nameLense :: Lens s a
const nameLense = R.lensProp("name");

// devicesLense :: Lens s a
const devicesLense = R.lensProp("devices");

// groupPrefix :: String => String
const groupPrefix = R.concat("group_");

// roomGroup :: String -> [Group]
const roomGroup = room => createGroupOfDevices(groupPrefix(room))(Rooms.getDevicesInRoom(room)); // todo: beautify

// typeGroup :: String -> [Group]
const typeGroup = type => createGroupOfDevices(groupPrefix(type))(Devices.getDevicesOfType(type)); // todo: beautify

// typeGroupName :: String => String
const roomTypeGroupName = type => room =>  groupPrefix(type + "_in_" + room);


// devicesInGroup :: Group -> [String]
const devicesInGroup = R.prop("devices");

// filterDevicesInGroup :: (a => bool) => Groups => Groups
const filterDevicesInGroups = func => R.pipe(
    R.toPairs,
    R.map(R.adjust(1, R.over(devicesLense, R.filter(func)))),
    R.fromPairs
);

const filterDevicesInGroupByType = type => filterDevicesInGroups(Devices.deviceHasType(type));

const renameGroup = name => R.pipe(
    R.toPairs,
    R.map(R.update(0, name)),
    R.fromPairs
);

// roomGroupOfType :: String, String -> [Group]
const roomGroupOfType = (room, type) => R.pipe(
    filterDevicesInGroupByType(type),
    renameGroup(roomTypeGroupName(room)(type)),
)(roomGroup(room));

module.exports = {
    knownGroups,
    createGroupOfDevices,
    roomGroupOfType,
    typeGroup,
    roomGroup,
    roomTypeGroupName,
    devicesInGroup,
};
