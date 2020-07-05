const R = require("ramda");
const Kefir = require("kefir");

const Lenses = require('../lenses');
const Events = require("./events");
const Util = require("../util");

// isMessageWithAvailabiltyInfo :: Msg => Boolean
const isMessageWithAvailabiltyInfo = R.pipe(
    R.view(Lenses.inputDataLens),
    R.has("availability")
);

// isOnlineMessage :: Msg => Boolean
const isOnlineMessage = R.pipe(
    R.view(Lenses.inputDataLens),
    R.propEq("availability", "online")
);

// isOnlineMessage :: Msg => Boolean
const isOfflineMessage = R.complement(isOnlineMessage);

const handleEachDeviceInANewStream = Util.groupBy(R.view(Lenses.inputNameLens));

// createDeviceOnlineEvent :: Msg => DeviceOnline
const createDeviceOnlineEvent = Events.createEventWithDeviceAndIdFromMsg("DeviceOnline");

// createDeviceOfflineEvent :: Msg => DeviceOffline
const createDeviceOfflineEvent = Events.createEventWithDeviceAndIdFromMsg("DeviceOffline");

// createDeviceStateEvent :: Msg => Either[DeviceOffline, DeviceOnline]
const createDeviceStateEvent = msg => isOnlineMessage(msg) ? createDeviceOnlineEvent(msg) : createDeviceOfflineEvent(msg);

// compareSameDeviceSameEvent :: Comperator
const compareSameDeviceSameEvent = (a, b) => a.id === b.id && a.device === b.device;

const input = new Kefir.pool();

const output = input
    .filter(isMessageWithAvailabiltyInfo)
    .thru(handleEachDeviceInANewStream)
    .flatMap( deviceStream => {
            return deviceStream
                .map(createDeviceStateEvent)
                .skipDuplicates(compareSameDeviceSameEvent)
                .debounce(300*1000); // offline/online for at least 5 minutes
        }
    );

module.exports = {
    input,
    output
};


