const R = require("ramda");
const Kefir = require("kefir");
const Events = require("../events/events");
const Notify = require("../interfaces/telegram");

const flowerNeedsIrrigation = Events.isEvent("IrrigationRequired");
const flowerNeedsFertilization= Events.isEvent("FertilizationRequired");
const flowerNeedsSomeLove = R.anyPass([flowerNeedsIrrigation, flowerNeedsFertilization]);

const sendFlowerStatusToUser = flowerEvent => Notify.sendMessage(
    `Your '${flowerEvent.alias}' needs some love. Irrigation or Fertilization required.`
)(flowerEvent);

const input = new Kefir.pool();

const output = input
    .filter(flowerNeedsSomeLove)
    .map(sendFlowerStatusToUser);

module.exports = {
    input,
    output
};
