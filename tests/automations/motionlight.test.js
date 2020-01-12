const MotionLight = require("../../automations/motionLight");
const R = require("ramda");

test('correct data is generated for set brightness', () => {
    expect(MotionLight.setBrightnessForDevice(255)("test_device")).toBe(
        {
            "test_device": {
                "state": "on",
                "brightness": 255,
            }
        }
    );
});

test('motionligt', () => {
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