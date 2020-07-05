const R = require("ramda");
const Kefir = require("kefir");

const Devices = require("../model/devices");
const Lenses = require('../lenses');
const Events = require("./events");

// contactLens :: Lens
const contactLens = R.compose(Lenses.inputDataLens, R.lensPath(["contact"]));

// opened :: Msg => Boolean
const closed = R.view(contactLens);

// opened :: Msg => Boolean
const opened = R.complement(closed);

const isContactSensor = R.pipe(
    R.view(Lenses.inputNameLens),
    Devices.deviceHasType("contact")
);

const isMailboxSensor = R.pipe(
    R.view(Lenses.inputNameLens),
    Devices.deviceHasSubType("mailbox")
);

const isMessageFromMailBoxContact = R.allPass([isContactSensor, isMailboxSensor]);

// isMessageWithContactInfo :: Msg => Boolean
const isMessageWithContactInfo = R.pipe(
    R.view(Lenses.inputDataLens),
    R.has("contact")
);

// createMailBoxOpenedEvent :: Msg => MailBoxOpened
const createMailBoxOpenedEvent = Events.createBasicEvent("MailBoxOpened");

const input = new Kefir.pool();

const mailBoxContactStream = input
    .filter(isMessageFromMailBoxContact)
    .filter(isMessageWithContactInfo)
    .filter(opened)
    .map(createMailBoxOpenedEvent);

const output = mailBoxContactStream;

module.exports = {
    input,
    output
};


