const R = require("ramda");
const Bacon = require("baconjs");
const Secrets = require("../config/secrets");
const BoschXmpp = require('bosch-xmpp');
const crypto = require('crypto');
const MD5 = (s, encoding) => crypto.createHash('md5').update(s).digest(encoding);
const MAGIC = Buffer.from(Secrets.easy_connect.magic, 'hex');
const schedule = require('node-schedule');

class EasyControlClient extends BoschXmpp.BaseClient {
    generateEncryptionKey() {
        const hash1 = MD5(Buffer.concat([Buffer.from(this.opts.accessKey), MAGIC]));
        const hash2 = MD5(Buffer.concat([MAGIC, Buffer.from(this.opts.password)]));
        const finalKey = Buffer.alloc(32);
        for (let i = 0; i < 16; i++) {
            finalKey[i] = hash1[i];
            finalKey[i + 16] = hash2[i];
        }
        return finalKey;
    }

    buildMessage(body) {
        let msg = super.buildMessage(body);
        return msg.replace(/\n\n/g, '\r\n');
    }
}

EasyControlClient.prototype.ACCESSKEY_PREFIX = Secrets.easy_connect.prefix;
EasyControlClient.prototype.RRC_CONTACT_PREFIX = Secrets.easy_connect.contact_prefix;
EasyControlClient.prototype.RRC_GATEWAY_PREFIX = Secrets.easy_connect.gateway_prefix;
EasyControlClient.prototype.USERAGENT = Secrets.easy_connect.agent;

const client = new EasyControlClient({
    serialNumber: Secrets.easy_connect.serialNumber,
    accessKey: Secrets.easy_connect.accessKey,
    password: Secrets.easy_connect.password,
    host: Secrets.easy_connect.host
});


const fetchDeviceTemperature = (id) => client.get('/devices/device' + id + "/etrv/temperatureActual").then(R.prop("value"));
const fetchDeviceName = (id) => client.get('/devices/device' + id + "/name").then(R.pipe(R.prop("value"), base64 => Buffer.from(base64, 'base64').toString('utf-8')));
const fetchDeviceZone = (id) => client.get('/devices/device' + id + "/zone").then(R.prop("value"));
const getDataFromDevice = id => [fetchDeviceTemperature(id), fetchDeviceName(id), fetchDeviceZone(id)];

const getEtrvIds = client.get('/devices/list')
    .then(
        R.pipe(
            R.prop("value"),
            R.filter(R.propEq("type", "thermostat_valve")),
            R.map(R.prop("id"))
        )
    );

client.connect().then();

const deviceInputStream = Bacon.fromBinder(function (sink) {
    schedule.scheduleJob("*/10 * * * * *", function () {
        getEtrvIds
            .then(
                R.pipe(
                    R.map(
                        R.pipe(
                            getDataFromDevice,
                            prs => Promise.all(prs)
                        )
                    ),
                    prs => Promise.all(prs)
                )
            )
            .then(
                R.map(R.zipObj(["temperature", "device", "zone"]))
            )
            .then(
                R.pipe(
                    R.map(obj => R.objOf(obj.device)(obj)),
                    R.map(R.map(R.dissoc("device"))),
                    R.forEach(
                        sink
                    )
                )
            )
    });
});

module.exports = {
    deviceInputStream,
};

