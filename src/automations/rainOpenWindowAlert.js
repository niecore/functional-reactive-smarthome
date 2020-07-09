const R = require("ramda");
const Kefir = require("kefir");
const Events = require("../events/events");
const Windows = require("../service/windows");
const Lenses = require("../lenses");

const startedToRain = Events.isEvent("StartedToRain");
const sendOpenWindowAlert = Events.createEvent({message: "It might rain soon and your windows are open."}, "NotifyUser");

// areAnyWindowsOpen :: event => boolean
const areAnyWindowsOpen = event => Windows.anyWindowsOpen(R.view(Lenses.stateLens, event.state));

const input = new Kefir.pool();

const output = input
    .filter(startedToRain)
    .filter(areAnyWindowsOpen)
    .map(sendOpenWindowAlert);

module.exports = {
    input,
    output
};
