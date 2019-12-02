const Automations = require('../config/automations.json');
const Routes = require('../router');
const motionLight = Automations.automations.motionLight;

motionLight.rooms.forEach(room => {
        roomMovementLightTrigger(room)
            .onValue(setLightsInRoom(room))
    }
);

const setLight