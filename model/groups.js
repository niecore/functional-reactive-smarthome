const R = require('ramda');
const Groups = require('../config/groups.json');
const Rooms = require('../model/rooms.js');

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

// topicLense :: Lens s a
const nameLense = R.lensProp("name");

// roomGroupName :: String => String
const roomGroupName = R.concat("room_group_");

// roomGroup :: String -> [Group]
const roomGroup = room => R.pipe(
    Rooms.getDevicesInRoom,
    createGroupOfDevices
);

// typeGroupName :: String => String
const typeGroupName = R.concat("type_group_");



console.log(roomGroup("staircase"));