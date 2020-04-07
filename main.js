
const Routes = require('./router');
const MotionLight = require('./automations/motionLight.js');
const Alarm = require('./automations/alarm.js');
const SceneSwitching = require('./automations/sceneControl.js');
const BrightnessControl = require('./automations/brightnessControl.js');
const InfluxDb = require('./automations/influxdbLogger');

console.log("Starting functional-reactive-smart-home.");

Routes.input
    .onValue(x => console.log(new Date().toString() + ": direction=input, input="  + JSON.stringify(x[0]) + " ,state=" + JSON.stringify(x[1])));

Routes.output
    .onValue(x => console.log(new Date().toString() + ": direction=output, input="  + JSON.stringify(x[0]) + " ,state=" + JSON.stringify(x[1])));
