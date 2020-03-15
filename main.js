
const Routes = require('./router');
const MotionLight = require('./automations/motionLight.js');
const Alarm = require('./automations/alarm.js');
const SceneSwitching = require('./automations/sceneControl.js');
const BrightnessControl = require('./automations/brightnessControl.js');
const InfluxDb = require('./automations/influxdbLogger');

const Presence = require('./model/presence');

console.log("Starting functional-reactive-smart-home.");

Routes.input
    .log(new Date().toString() + ": input : ")
    .subscribe();

Routes.output
    .log(new Date().toString() + ": output : ")
    .subscribe();