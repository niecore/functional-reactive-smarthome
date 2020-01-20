const MotionLight = require("../../automations/motionLight");
const Rooms = require("../../model/rooms");
const Light = require("../../model/light");
const R = require("ramda");

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
        Rooms.getStateOfDeviceInSameRoom(
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
        Light.isMessageFromRoomWithLightOff(
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

