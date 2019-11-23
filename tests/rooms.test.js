const Rooms = require('../model/rooms');
const R = require("ramda");

test('get room by name returns a room', () => {
    expect(Rooms.getRoomByName("empty_room")).toMatchObject({name: "empty_room"})
});

test('get devices on empty room returns empty array', () => {
    expect(Rooms.getDevicesInRoom("empty_room")).toHaveLength(0)
});

test('get devices on non empty room returns array with correct length', () => {
    expect(Rooms.getDevicesInRoom("first_room")).toHaveLength(1)
});


test('get devices on non empty room returns device array', () => {
    expect(Rooms.getDevicesInRoom("first_room")).toEqual(          // 1
        expect.arrayContaining([      // 2
            expect.objectContaining({   // 3
                name: 'device_id_1'               // 4
            })
        ])
    )
});

test('is in room can detect a device in a room', () => {
    expect(Rooms.isInRoom("first_room")({name:"device_id_1"})).toBeTruthy()
});

test('is in room can detect a device that is not in a room', () => {
    expect(Rooms.isInRoom("first_room")({name:"unknown_device"})).toBeFalsy()
});

