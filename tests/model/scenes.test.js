const Scenes = require('../../src/model/scenes');

test('get room by name returns a room', () => {
    expect(Scenes.filterSceneByDevicesInRoom("first_room")(Scenes.getSceneByName("test_scene_1"))).toEqual(
        {
            "device_id_1": {
                "state": "ON"
            }
        }
    )
});
