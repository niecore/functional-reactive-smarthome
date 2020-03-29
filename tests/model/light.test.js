const Light = require("../../model/light");

require('../extend-expect');

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
