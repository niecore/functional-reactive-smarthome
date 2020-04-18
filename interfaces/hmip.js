const R = require("ramda");
const Kefir = require("kefir");
const xmlrpc = require('homematic-xmlrpc');
const Interfaces = require("../config/interfaces");
const Devices = require("../model/devices");

const server = xmlrpc.createServer({host: Interfaces.hmip.client_address, port: 2010});
const init_url = 'http://' + Interfaces.hmip.client_address + ':' + 2010;
const client = xmlrpc.createClient({
    host: Interfaces.hmip.server_address,
    port: 2010,
    path: '/'
});

client.methodCall('init', [init_url, 'frs'], (err, res) => {
    if (err) {
        console.log("unable to connect to ccu: " + err)
    }
});

server.on("event", (err, params, callback) => {
    callback(null, '');
});

server.on("listDevices", (err, params, callback) => {
    callback(null, []);
});

server.on("newDevices", (err, params, callback) => {
    callback(null, []);
});

server.on("deleteDevices", (err, params, callback) => {
    callback(null, []);
});

server.on('system.multicall', (_, params, callback) => {
    params[0].forEach(c => {
        const m = c.methodName;
        const p = c.params;
        server.emit(m, null, p, callback);
    });
});

const isHmipDevice = R.propEq("interface", "hmip");

const hmipDevices = R.pickBy(isHmipDevice, Devices.knownDevices);

const isFromKnownHmipDevice = params => {
    return R.includes(
        params[1].split(":")[0],
        R.values(R.map(device => device.address, hmipDevices))
    )
};

const isTemperatureValue = params => {
    return R.includes(params[2], ["ACTUAL_TEMPERATURE", "SET_POINT_TEMPERATURE"])
};

const getDeviceNameFromAddress = address => {
    return R.pipe(
        R.pickBy(R.propEq("address", address.split(":")[0])),
        R.keys,
        R.head
    )(hmipDevices);
};

const transformValueKey = R.prop(R.__, {
    ACTUAL_TEMPERATURE: "temperature",
    SET_POINT_TEMPERATURE: "setpoint"
});

const deviceInputStream = Kefir.fromEvents(server, 'event', (_, params, __) => params)
    .filter(isFromKnownHmipDevice)
    .filter(isTemperatureValue)
    .map(x => R.objOf(getDeviceNameFromAddress(x[1]), R.objOf(transformValueKey(x[2]), x[3])));

module.exports = {
    deviceInputStream,
};

