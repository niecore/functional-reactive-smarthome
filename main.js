const Routes = require('./router');
const MotionLight = require('./automations/motionLight.js');
const RemoteSceneControl = require('./model/scenes.js');

console.log("Starting functional-reactive-smart-home.");

Routes.input
    .log(new Date().toString() + ": input : ")
    .subscribe();

Routes.output
    .log(new Date().toString() + ": output : ")
    .subscribe();