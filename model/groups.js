const R = require('ramda');
const Devices = require('../config/devices.json');
const Groups = require('../config/groups.json');
const Rooms = require('../model/rooms.js');

// usergroups :: [Group]
const userGroups = Groups.groups;

// topicLense :: Lens s a
const nameLense = R.lensProp("name");

// roomGroupName :: String => String
const roomGroupName = R.append(R.__, "room_group_");

// roomGroup :: String -> [Group]
const roomGroup = room => Rooms.knownRooms
    .filter(R.propEq("name", room))
    .map(R.pick(["name", "devices"]))
    .map(R.over(nameLense, roomGroupName));

// typeGroupName :: String => String
const typeGroupName = R.append(R.__, "type_group_");

// deviceTypeGroup :: String -> [Group]
const deviceTypeGroup = deviceType => Devices.devices
    .filter(R.propEq("type", deviceType))
    .map(R.prop("name"))
    .map(R.objOf(typeGroupName(deviceType)));


console.log(deviceTypeGroup('motion_sensor'));
console.log(roomGroup("staircase"));