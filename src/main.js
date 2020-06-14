const Hub = require('./hub');
const Router = require("./router");
const Server = require("./server");

console.log("Starting functional-reactive-smart-home.");

Hub.input
    .onValue(x => console.log(JSON.stringify({"input": x[0], "state": x[1]})));

Hub.output
    .onValue(x => console.log(JSON.stringify({"output": x})));

Hub.events
    .onValue(x => console.log(JSON.stringify({"event": x, })));
