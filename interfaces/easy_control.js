const R = require("ramda");
const Bacon = require("baconjs");
const schedule = require('node-schedule');

async function getEasyControlClient() {

    const Secrets = require("../model/secrets");
    const BoschXmpp = require('bosch-xmpp');
    const crypto = require('crypto');
    const MD5 = (s, encoding) => crypto.createHash('md5').update(s).digest(encoding);

    const ease_control_credentials = await Secrets.getEasyControlCredentials();

    class EasyControlClient extends BoschXmpp.BaseClient {
        generateEncryptionKey() {
            const MAGIC = Buffer.from(ease_control_credentials.magic, 'hex');
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

    EasyControlClient.prototype.ACCESSKEY_PREFIX = ease_control_credentials.prefix;
    EasyControlClient.prototype.RRC_CONTACT_PREFIX = ease_control_credentials.contact_prefix;
    EasyControlClient.prototype.RRC_GATEWAY_PREFIX = ease_control_credentials.gateway_prefix;
    EasyControlClient.prototype.USERAGENT = ease_control_credentials.agent;

    const client = new EasyControlClient({
        serialNumber: ease_control_credentials.serialNumber,
        accessKey: ease_control_credentials.accessKey,
        password: ease_control_credentials.password,
        host: ease_control_credentials.host
    });

    await client.connect();

    return client
}

const deviceInputStream = getEasyControlClient().then(client => {
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

    const deviceInputStream = Bacon.fromBinder(function (sink) {
        schedule.scheduleJob("*/5 * * * *", function () {
            getEtrvIds
                .then(ids => Promise.all(
                    ids.map(id => Promise.all(
                        getDataFromDevice(id)
                    ))
                ))
                .then(
                    R.pipe(
                        R.map(R.zipObj(["temperature", "device", "zone"])),
                        R.map(obj => R.objOf(obj.device)(obj)),
                        R.map(R.map(R.dissoc("device"))),
                    ) // [temperature, device, zone] => {device = {temperature: val, zone: val }}
                )
                .then(R.forEach(sink))
        });
    });

    return deviceInputStream;
});

module.exports = {
    deviceInputStream,
};

