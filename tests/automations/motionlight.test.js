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
                        state: "off"
                    }
                }
            ]
        )
    ).toEqual(
        {light_1: {state: "off"}}
        );
});

test('test is isMessageFromRoomWithLightOn', () => {
    expect(
        MotionLight.isMessageFromRoomWithLightOn(
            [
                {
                    motion_sensor_1: {
                        occupancy: true
                    }
                },
                {
                    light_1: {
                        state: "off"
                    }
                }
            ]
        )
    ).toBeTruthy();
});

