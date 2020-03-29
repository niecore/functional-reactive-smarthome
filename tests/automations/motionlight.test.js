const MotionLight = require("../../automations/motionLight");
const Presence = require("../../model/presence");
const Logic = require("../../model/logic");
const Light = require("../../model/light");
const R = require("ramda");
const Kefir = require('kefir');

require('../extend-expect');


test('test is getStateOfDeviceInSameRoom', () => {
    expect(
        Logic.getStateOfDeviceInSameRoom(
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
        {
            light_1: {state: "OFF"}
        }
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

test('test', () => {
    expect(Kefir.stream()).toBeStream()
});

