const MotionLight = require("../../automations/motionLight");
const R = require("ramda");

test('correct data is generated for set brightness', () => {
    expect(MotionLight.setBrightnessForDevice(255)("test_device")).toStrictEqual(
        {
            "test_device": {
                "state": "on",
                "brightness": 255,
                "transition": 1,
            }
        }
    );
});

test('test movement detection', () => {
    expect(MotionLight.movementDetected(
        [
            {
                motion_light: {
                    occupancy: true
                }
            },
            {}
        ]
    )).toBe(true);
});