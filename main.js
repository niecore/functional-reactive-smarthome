
const Routes = require('./router');
const MotionLight = require('./automations/motionLight.js');
const Alarm = require('./automations/alarm.js');
const SceneSwitching = require('./automations/sceneControl.js');
const BrightnessControl = require('./automations/brightnessControl.js');
const InfluxDb = require('./automations/influxdbLogger');

console.log("Starting functional-reactive-smart-home.");

Routes.input
    .onValue(x => console.log({"input": x[0], "state": x[1]}));

Routes.output
    .onValue(x => console.log({"output": x}));
