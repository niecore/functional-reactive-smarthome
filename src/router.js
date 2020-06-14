//
//  This file currently represents the logic that should be handled by a plugin system
//

// Interfaces
const Zigbee = require('./interfaces/zigbee');
const Shelly = require('./interfaces/shelly');
const EasyControl = require('./interfaces/easy_control');
const XiaomiScale = require('./interfaces/xiaomi_scale');
const Tasmota = require('./interfaces/tasmota');
const Hmip = require('./interfaces/hmip');
const InfluxDb = require('./interfaces/influx_db');

// Model
const Devices = require("./model/devices");
const Groups = require("./model/groups");

// Devices
const TradfriRemote = require("./devices/tradfriRemote");

// Automations
const MotionLight = require('./automations/motionLight.js');
const Dimming = require('./control/dimming.js');
const Scenes = require('./control/sceneSwitching.js');

// Events
const LuminosityInRoom = require("./events/LuminosityInRoom");
const MovementDetected = require("./events/MovementDetected");
const PresenceDetected = require("./events/PresenceDetected");
const TurnLightOn = require("./events/TurnLightOn");
const TurnNightLightsOn = require("./events/TurnNightLightOn");
const TurnAllLightsOff = require("./events/TurnAllLightsOff");
const ChangeBrightness = require("./events/ChangeBrightness");
const StartScene = require("./events/StartScene");

// Service
const Service = require("./service/service");
const Lights = require("./service/lights");

const Hub = require("./hub");

// Plug interfaces input to hub
Hub.update.plug(Zigbee.deviceInputStream);
Hub.update.plug(Shelly.deviceInputStream);
Hub.update.plug(XiaomiScale.deviceInputStream);
Hub.update.plug(Tasmota.deviceInputStream);
Hub.update.plug(Hmip.deviceInputStream);

InfluxDb.input.plug(Hub.input);

EasyControl.deviceInputStream.then(function (stream) {
    Hub.update.plug(stream)
});

// Plug services            input -> ()
Service.input.plug(Hub.input);

// Plug Devices             input => events
TradfriRemote.input.plug(Hub.input);
Hub.events.plug(TradfriRemote.output);

// Plug Events of Type 1    input -> events
MovementDetected.input.plug(Hub.input);
Hub.events.plug(MovementDetected.output);

LuminosityInRoom.input.plug(Hub.input);
Hub.events.plug(LuminosityInRoom.output);

// Plug Events of Type 2    events -> events
PresenceDetected.input.plug(Hub.events);
Hub.events.plug(PresenceDetected.output);

// Plug Events of Type 3    events -> output
TurnLightOn.input.plug(Hub.events);
Hub.output.plug(TurnLightOn.output);

TurnNightLightsOn.input.plug(Hub.events);
Hub.output.plug(TurnNightLightsOn.output);

TurnAllLightsOff.input.plug(Hub.events);
Hub.output.plug(TurnAllLightsOff.output);

ChangeBrightness.input.plug(Hub.events);
Hub.output.plug(ChangeBrightness.output);

StartScene.input.plug(Hub.events);
Hub.output.plug(StartScene.output);

// Plug Automations         events -> events
MotionLight.input.plug(Hub.events);
Hub.events.plug(MotionLight.output);

Dimming.input.plug(Hub.events);
Hub.events.plug(Dimming.output);

Scenes.input.plug(Hub.events);
Hub.events.plug(Scenes.output);

// Plug hub output to interfaces
const devices = Hub.output.map(Groups.filterMsgIsDevice);
const groups = Hub.output.map(Groups.filterMsgIsGroup);

Zigbee.deviceOutputStream.plug(devices.map(Devices.filterMsgByDeviceInterface("zigbee")));
Zigbee.groupOutputStream.plug(groups);

Shelly.deviceOutputStream.plug(devices.map(Devices.filterMsgByDeviceInterface("shelly")));
Shelly.groupOutputStream.plug(groups);

Tasmota.deviceOutputStream.plug(devices.map(Devices.filterMsgByDeviceInterface("tasmota")));
Tasmota.groupOutputStream.plug(groups);
