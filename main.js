const Hub = require('./hub');
const Router = require("./router");

console.log("Starting functional-reactive-smart-home.");

Routes.input
    .onValue(x => console.log(JSON.stringify({"input": x[0], "state": x[1]})));

Routes.output
    .onValue(x => console.log(JSON.stringify({"output": x})));
