const Devices = require('../model/devices');
const R = require("ramda");

test('device type can be checked', () => {
    expect(Devices.deviceHasType("type_1")("device_id_1")).toBeTruthy();
    expect(Devices.deviceHasType("wrong_type")("device_id_1")).toBeFalsy();
});

