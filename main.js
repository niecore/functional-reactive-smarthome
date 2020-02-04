const Routes = require('./router');
const MotionLight = require('./automations/motionLight.js');
const Alarm = require('./automations/alarm.js');
const SceneSwitching = require('./automations/sceneSwitching.js');

console.log("Starting functional-reactive-smart-home.");

Routes.input
    .log(new Date().toString() + ": input : ")
    .subscribe();

Routes.output
    .log(new Date().toString() + ": output : ")
    .subscribe();