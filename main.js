const Routes = require('./router');
const MotionLight = require('./automations/motionLight.js');

console.log("Starting functional-reactive-smart-home.");

Routes.input
    .log("input: ")
    .subscribe();

Routes.output
    .log("output: ")
    .subscribe();