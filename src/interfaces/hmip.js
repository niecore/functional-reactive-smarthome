const R = require("ramda");
const Kefir = require("kefir");
const xmlrpc = require('homematic-xmlrpc');
const Interfaces = require("../../config/interfaces");
const async = require('async');
const Devices = require("../model/devices");
const Util = require('../util');

const server = xmlrpc.createServer({host: "0.0.0.0", port: 2011});
const init_url = 'http://' + Interfaces.hmip.client_address + ':' + 2011;
const client = xmlrpc.createClient({
    host: Interfaces.hmip.server_address,
    port: 2010,
    path: '/'
});

client.methodCall('init', [init_url, 'frs-asdasd'], (err, res) => {
    if (err) {
        console.log("unable to connect to ccu: " + err)
    }
});

const returnEmptyList = (err, params, callback) => {
    callback(null, []);
};

const returnEmptyString = (err, params, callback) => {
    callback(null, '');
};

server.on("event", (err, params, callback) => {
    callback(null, '');
    server.emit("event-stream", null, params, callback);
});

server.on("listDevices", returnEmptyList);
server.on("newDevices", returnEmptyList);
server.on("deleteDevices", returnEmptyList);

server.on('system.multicall', (_, params, callback) => {
    const queue = [];
    params[0].forEach(c => {
        const m = c.methodName;
        const p = c.params;

        if(m == "event"){
            queue.push(cb => {
                returnEmptyString(null, p, cb);
            });
            server.emit("event-stream", null, p, callback);
        } else {
            queue.push(cb => {
                returnEmptyList(null, p, cb);
            });
        }
    });
    async.series(queue, callback);
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

const toHmipData = data => {
    const device = Devices.getDeviceByName(data.key);
    const typeOfDevice = R.prop("type", device);

    if(typeOfDevice === "etrv") {
        const isSetpoint = R.has("setpoint")(data.value);
        if(isSetpoint) {
            return ({address: device.address + ":1", parameter: "SET_POINT_TEMPERATURE", value: data.value.setpoint})
        }
    }
    return {};
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

const hmipEventStream = Kefir.stream(function (emitter) {
    server.on("event-stream", (err, params, callback) => {
        emitter.emit(params)
    });
});

const setValue = data => {
    client.methodCall('setValue', [data.address, data.parameter, data.value], (err, res) => {
        if (err) {
            console.log("unable to set value on hmip")
        }
    });
};

const deviceInputStream = hmipEventStream
    .filter(isFromKnownHmipDevice)
    .map(x => [getDeviceNameFromAddress(x[1]), x[2], x[3]])
    .map(x => [x[0], x[1], x[2], getDeviceType(x[0])])
    .filter(x => R.includes(x[3], supportedDeviceTypes))
    .map(fromHmipData)
    .filter(R.pipe(R.isNil, R.not))
    .map(transformToFrsObject);

const deviceOutputStream = new Kefir.pool();

deviceOutputStream
    .map(Util.convertToArray)
    .map(R.map(toHmipData))
    .onValue(
        array => array.forEach(input =>
            setValue(input)
        )
    );


module.exports = {
    deviceInputStream,
    deviceOutputStream,
};

