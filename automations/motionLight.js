const Bacon = require("baconjs");
const R = require('ramda');
const Devices = require('../config/devices.json');
const Automations = require('../config/automations.json');
const Routes = require('../router');

const motionLight = Automations.automations.motionLight;
const deviceStream = Routes.deviceInputStream;



motionLight.rooms.forEach(room => {
        roomMovementLightTrigger(room)
            .onValue(setLightsInRoom(room))
    }
);