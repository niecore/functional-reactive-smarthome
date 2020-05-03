const R = require("ramda");

const Scenes = require('../model/scenes');
const Util = require('../model/util');

const output = Util.schedulerStream({activate: false})("0 0 8 * * *")
    .filter(R.prop("activate"))
    .map(Scenes.getSceneByName("wake_up_bed_room"))
    .map(R.head);

module.exports = {
    output
};
