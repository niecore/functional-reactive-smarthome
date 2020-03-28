const R = require('ramda');
const Kefir = require('kefir');
const Influx = require('influx');
const Lenses = require('../lenses');
const Devices = require('../model/devices');
const Rooms = require('../model/rooms');
const Interfaces = require('../config/interfaces.json');

const influx = new Influx.InfluxDB({
    host: Interfaces.influxdb.address,
    database: Interfaces.influxdb.db
});

const input = new Kefir.pool();

input.filter(Devices.isMessageFromDevice)
    .onValue(value => {
        const device = R.view(Lenses.inputNameLens)(value);
        const type = Devices.getDeviceByName(device).type;
        const room = Rooms.getRoomOfDevice(device);
        const data = R.view(Lenses.inputDataLens)(value);

        const isValidType = v => (R.type(v) === 'Number' || R.type(v) === 'String' || R.type(v) === 'Boolean');

        influx.writePoints([
            {
                measurement: 'data-input',
                tags: {
                    device: device,
                    type: type,
                    room: room,
                },
                fields: R.filter(isValidType, data)
            }
        ]).catch(error => {
            console.error(`Error saving data to InfluxDB! ${err.stack}`)
        })
});

module.exports = {
    input
};
