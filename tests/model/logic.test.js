const Logic = require("../../model/logic");

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
