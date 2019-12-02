const Groups = require('../model/groups');
const R = require("ramda");

test('devices in group returns a list of devices', () => {
    expect(Groups.devicesInGroup(Groups.knownGroups[0])).toEqual([
        "device_id_1",
        "device_id_2"
    ])
});
