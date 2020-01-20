const MotionLight = require("../../automations/motionLight");
const R = require("ramda");

test('correct data is generated for set brightness', () => {
    expect(MotionLight.setBrightnessForDevice(255)("test_device")).toStrictEqual(
        {
            "test_device": {
                "state": "ON",
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
                motion_sensor_1: {
                    occupancy: true
                }
            },
            {}
        ]
    )).toBe(true);
});

test('test is getStateOfDeviceInSameRoom', () => {
    expect(
        MotionLight.getStateOfDeviceInSameRoom(
        [
                {
                    motion_sensor_1: {
                        occupancy: true
                    }
                },
                {
                    light_1: {
                        state: "OFF"
                    }
                }
            ]
        )
    ).toEqual(
        {light_1: {state: "OFF"}}
        );
});

test('test is isMessageFromRoomWithLightOn', () => {
    expect(
        MotionLight.isMessageFromRoomWithLightOff(
            [
                {
                    motion_sensor_1: {
                        occupancy: true
                    }
                },
                {
                    light_1: {
                        state: "OFF"
                    }
                }
            ]
        )
    ).toBeTruthy();
});

