const R = require("ramda");
const Kefir = require("kefir");
const xmlrpc = require('homematic-xmlrpc');
const Interfaces = require("../config/interfaces");
const Devices = require("../model/devices");

const server = xmlrpc.createServer({host: "0.0.0.0", port: 2011});
const init_url = 'http://' + Interfaces.hmip.client_address + ':' + 2011;
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

const supportedDeviceTypes = ["etrv"];

const transformToFrsObject = x => R.objOf(x[0], R.objOf(x[1], x[2]));

const getKnownHmipAddresses = R.values(R.map(device => device.address, hmipDevices));

const removeChannelFromAddress = x => x.split(":")[0];

const isSupportedEtrvValue = key => R.includes(key, ["ACTUAL_TEMPERATURE", "SET_POINT_TEMPERATURE"]);

const etrVtransformValueKey = R.prop(R.__, {
    ACTUAL_TEMPERATURE: "temperature",
    SET_POINT_TEMPERATURE: "setpoint"
});

const isFromKnownHmipDevice = R.pipe(
    R.nth(1),
    removeChannelFromAddress,
    R.includes(R.__, getKnownHmipAddresses)
);

const fromHmipData = params => {
    if (params[3] === "etrv") {
        if (isSupportedEtrvValue(params[1])) {
            return [params[0], etrVtransformValueKey(params[1]), params[2]]
        }
    }
};

const getDeviceNameFromAddress = address => {
    return R.pipe(
        R.pickBy(R.propEq("address", address.split(":")[0])),
        R.keys,
        R.head
    )(hmipDevices);
};

const getDeviceType = R.pipe(
    Devices.getDeviceByName,
    R.prop("type")
);

const deviceInputStream = Kefir.fromEvents(server, 'event', (_, params, __) => params)
    .filter(isFromKnownHmipDevice)
    .map(x => [getDeviceNameFromAddress(x[1]), x[2], x[3]])
    .map(x => [x[0], x[1], x[2], getDeviceType(x[0])])
    .filter(x => R.includes(x[3], supportedDeviceTypes))
    .map(fromHmipData)
    .filter(R.pipe(R.isNil, R.not))
    .map(transformToFrsObject);

module.exports = {
    deviceInputStream,
};

