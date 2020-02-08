const R = require('ramda');
const Influx = require('influx');
const Routes = require('../router');
const Lenses = require('../lenses');
const Devices = require('../model/devices');
const Rooms = require('../model/rooms');
const Interfaces = require('../config/interfaces.json');

const influx = new Influx.InfluxDB({
    host: Interfaces.influxdb.address,
    database: Interfaces.influxdb.db
});

Routes.input.onValue( value => {

    const device = R.view(Lenses.inputNameLens)(value);
    const type = Devices.getDeviceByName(device).type;
    const room = Rooms.getRoomOfDevice(device);
    const data = R.view(Lenses.inputDataLens)(value);

    influx.writePoints([
        {
            measurement: 'data-input',
            tags: {
                device: device,
                type: type,
                room: room,
            },
            fields: data
        }
    ]).catch(error => {
        console.error(`Error saving data to InfluxDB! ${err.stack}`)
    })
});
