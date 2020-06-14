const Groups = require('../../src/model/groups');
const Rooms = require('../../src/model/rooms');
const R = require("ramda");

test('devices in group returns a list of devices', () => {
    expect(Groups.devicesInGroup(Groups.knownGroups.test_group_1)).toEqual([
        "device_id_1",
        "device_id_2"
    ])
});

test('room group returns a group in the correct formst', () => {
    expect(Groups.roomGroup("first_room")).toEqual(
        {
            "group_first_room": {
                "devices": ["device_id_1"]
            }
        }
    )
});

test('expand groups', () => {
    expect(Groups.expandGroupMsg({"test_group_1": 42})).toEqual(
        {
            "device_id_1": 42,
            "device_id_2": 42,
        }
    )
});
