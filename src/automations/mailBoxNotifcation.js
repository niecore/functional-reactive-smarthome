const R = require("ramda");
const Kefir = require("kefir");
const Util = require("../util");
const Events = require("../events/events");

const input = new Kefir.pool();

const isMailBoxOpenedEvent = Events.isEvent("MailBoxOpened");
const createMailBoxOpenedNotification = Events.createEvent({message: "Your mailbox has been opened right now."}, "NotifyUser");
const onlyOneNotificationPerDay = Util.throttleOncePerDay;

const output = input
    .filter(isMailBoxOpenedEvent)
    .map(createMailBoxOpenedNotification)
    .thru(onlyOneNotificationPerDay);

module.exports = {
    input,
    output
};
