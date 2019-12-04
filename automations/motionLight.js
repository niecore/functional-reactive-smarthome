const Automations = require('../config/automations.json');
const Routes = require('../router');
const motionLight = Automations.automations.motionLight;
const Zigbee = require('./interfaces/zigbee');
const Groups = require('./model/groups');

motionLight.rooms.forEach(room => {
        roomMovementLightTrigger(room)
            .onValue(setLightsInRoom(room))
    }
);

// To be expanded for multiple interfaces
Zigbee.createGroups(
    R.mergeAll([
        Groups.roomGroupOfType("staircase", "light"), // to be created by automations
        Groups.knownGroups,
    ])
);