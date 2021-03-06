//
//  This file currently represents the logic that should be handled by a plugin system
//

// Interfaces
const Zigbee = require('./interfaces/zigbee');
const Shelly = require('./interfaces/shelly');
const EasyControl = require('./interfaces/easyControl');
const XiaomiScale = require('./interfaces/xiaomiScale');
const Tasmota = require('./interfaces/tasmota');
const Hmip = require('./interfaces/hmip');
const InfluxDb = require('./interfaces/influxDb');
const Telegram = require('./interfaces/telegram');
const Weather = require('./interfaces/weather');
const Ble = require('./interfaces/ble');

// Model
const Devices = require("./model/devices");
const Groups = require("./model/groups");

// Devices
const TradfriRemote = require("./devices/tradfriRemote");
const TradfriRemoteSmall = require("./devices/tradfriRemoteSmall");

// Automations
const AmbientLight = require('./automations/ambientLight.js');
const MotionLight = require('./automations/motionLight.js');
const MailBoxNotification = require('./automations/mailBoxNotifcation.js');
const DeviceUnreachableNotification = require('./automations/deviceUnreachableNotification.js');
const RainOpenWindowAlert = require('./automations/rainOpenWindowAlert.js');
const FlowerNeedsLoveAlert = require("./automations/flowerNeedsLoveAlert");
const ClimateProgram = require("./automations/climateProgram");
const HeatReductionWithOpenWindow = require("./automations/heatReductionWithOpenWindow");

// Control
const Dimming = require('./control/dimming.js');
const Scenes = require('./control/sceneSwitching.js');
const OnOffToggle = require('./control/onOffToggle.js');
const OnOffSwitch = require('./control/onOffSwitch.js');

// Events
const LuminosityInRoom = require("./events/luminosityInRoom");
const MovementDetected = require("./events/movementDetected");
const PresenceDetected = require("./events/presenceDetected");
const TurnLightOn = require("./events/turnLightOnOff");
const TurnNightLightsOn = require("./events/turnNightLightOn");
const ChangeBrightness = require("./events/changeBrightness");
const StartScene = require("./events/startScene");
const DoorWindowOpenedClosed = require("./events/doorWindowOpenedClosed");
const MailBoxOpened = require("./events/mailBoxOpened");
const DeviceOnlineOffline = require("./events/deviceOfflineOnline");
const StartedToRain = require("./events/startedToRain");
const IrrigationFertilzationRequired = require('./events/irrigationFertilizationRequired.js');
const SetTemperatureInRoom = require('./events/setTemperatureInRoom.js');
const HeatReductionInRoom = require('./events/heatReductionInRoom.js');

// Service
const Lights = require("./service/lights");

const Hub = require("./hub");

// Plug interfaces input to hub
Hub.update.plug(Zigbee.deviceInputStream);
Hub.update.plug(Shelly.deviceInputStream);
Hub.update.plug(XiaomiScale.deviceInputStream);
Hub.update.plug(Tasmota.deviceInputStream);
Hub.update.plug(Hmip.deviceInputStream);
Hub.update.plug(Weather.deviceInputStream);
Hub.update.plug(Ble.deviceInputStream);

InfluxDb.input.plug(Hub.input);
Telegram.input.plug(Hub.events);

EasyControl.deviceInputStream.then(function (stream) {
    Hub.update.plug(stream)
});

// Plug Devices             input => events
TradfriRemote.input.plug(Hub.input);
Hub.events.plug(TradfriRemote.output);

TradfriRemoteSmall.input.plug(Hub.input);
Hub.events.plug(TradfriRemoteSmall.output);

// Plug Events of Type 1    input -> events
MovementDetected.input.plug(Hub.input);
Hub.events.plug(MovementDetected.output);

LuminosityInRoom.input.plug(Hub.input);
Hub.events.plug(LuminosityInRoom.output);

DoorWindowOpenedClosed.input.plug(Hub.input);
Hub.events.plug(DoorWindowOpenedClosed.output);

MailBoxOpened.input.plug(Hub.input);
Hub.events.plug(MailBoxOpened.output);

DeviceOnlineOffline.input.plug(Hub.input);
Hub.events.plug(DeviceOnlineOffline.output);

StartedToRain.input.plug(Hub.input);
Hub.events.plug(StartedToRain.output);

IrrigationFertilzationRequired.input.plug(Hub.input);
Hub.events.plug(IrrigationFertilzationRequired.output);

// Plug Events of Type 2    events -> events
PresenceDetected.input.plug(Hub.events);
Hub.events.plug(PresenceDetected.output);

// Plug Events of Type 3    events -> output
TurnLightOn.input.plug(Hub.events);
Hub.output.plug(TurnLightOn.output);

TurnNightLightsOn.input.plug(Hub.events);
Hub.output.plug(TurnNightLightsOn.output);

ChangeBrightness.input.plug(Hub.events);
Hub.output.plug(ChangeBrightness.output);

StartScene.input.plug(Hub.events);
Hub.output.plug(StartScene.output);

SetTemperatureInRoom.input.plug(Hub.events);
Hub.output.plug(SetTemperatureInRoom.output);

HeatReductionInRoom.input.plug(Hub.events);
Hub.output.plug(HeatReductionInRoom.output);

// Plug Automations         events -> events
MotionLight.input.plug(Hub.events);
Hub.events.plug(MotionLight.output);

AmbientLight.input.plug(Hub.events);
Hub.events.plug(AmbientLight.output);

MailBoxNotification.input.plug(Hub.events);
Hub.events.plug(MailBoxNotification.output);

DeviceUnreachableNotification.input.plug(Hub.events);
Hub.events.plug(DeviceUnreachableNotification.output);

RainOpenWindowAlert.input.plug(Hub.events);
Hub.events.plug(RainOpenWindowAlert.output);

FlowerNeedsLoveAlert.input.plug(Hub.events);
Hub.events.plug(FlowerNeedsLoveAlert.output);

Dimming.input.plug(Hub.events);
Hub.events.plug(Dimming.output);

Scenes.input.plug(Hub.events);
Hub.events.plug(Scenes.output);

OnOffToggle.input.plug(Hub.events);
Hub.events.plug(OnOffToggle.output);

OnOffSwitch.input.plug(Hub.events);
Hub.events.plug(OnOffSwitch.output);

ClimateProgram.input.plug(Hub.events);
Hub.events.plug(ClimateProgram.output);

HeatReductionWithOpenWindow.input.plug(Hub.events);
Hub.events.plug(HeatReductionWithOpenWindow.output);

// Plug hub output to interfaces
const devices = Hub.output.map(Groups.filterMsgIsDevice);
const groups = Hub.output.map(Groups.filterMsgIsGroup);

Zigbee.deviceOutputStream.plug(devices.map(Devices.filterMsgByDeviceInterface("zigbee")));
Zigbee.groupOutputStream.plug(groups);

Shelly.deviceOutputStream.plug(devices.map(Devices.filterMsgByDeviceInterface("shelly")));
Shelly.groupOutputStream.plug(groups);

Tasmota.deviceOutputStream.plug(devices.map(Devices.filterMsgByDeviceInterface("tasmota")));
Tasmota.groupOutputStream.plug(groups);

Hmip.deviceOutputStream.plug(devices.map(Devices.filterMsgByDeviceInterface("hmip")));
