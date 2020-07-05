const R = require("ramda");
const Lenses = require("../lenses");

const _createBasicEvent = (id, state) => ({id: id, state: state});
const createBasicEvent = R.curry(_createBasicEvent);
const _createEvent = (fields, id, state) => R.mergeLeft(createBasicEvent(id)(state), fields);
const createEvent = R.curry(_createEvent);

const isEvent = id => R.propEq("id", id);
const getState = R.prop("state");

const createEventWithDeviceAndIdFromMsg = id => msg => createEvent({device: R.view(Lenses.inputNameLens)(msg)}, id)(msg);

module.exports = {
    createBasicEvent,
    createEvent,
    isEvent,
    getState,
    createEventWithDeviceAndIdFromMsg
};