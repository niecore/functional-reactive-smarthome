const R = require("ramda");
const Kefir = require("kefir");
const Util = require("../util");
const Events = require("../events/events");

const input = new Kefir.pool();

const mailboxHasBeenOpened = Events.isEvent("MailBoxOpened");
const sendMailboxOpenedNotification = Events.createEvent({message: "Your mailbox has been opened right now."}, "NotifyUser");
const onlyOneNotificationPerDay = Util.throttleOncePerDay;

const output = input
    .filter(mailboxHasBeenOpened)
    .map(sendMailboxOpenedNotification)
    .thru(onlyOneNotificationPerDay);

module.exports = {
    input,
    output
};
