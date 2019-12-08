const Rooms = require('../../model/rooms');
const R = require("ramda");

test('get room by name returns a room', () => {
    expect(Rooms.getRoomByName("empty_room")).toMatchObject({})
});

test('get devices on empty room returns empty array', () => {
    expect(Rooms.getDevicesInRoom("empty_room")).toHaveLength(0)
});

test('get devices on non empty room returns array with correct length', () => {
    expect(Rooms.getDevicesInRoom("first_room")).toHaveLength(1)
});

test('get devices on non empty room returns device array', () => {
    expect(Rooms.getDevicesInRoom("first_room")).toEqual(
        ['device_id_1']
    );
});