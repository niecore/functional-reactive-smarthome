const Hub = require('./hub');

console.log("Starting functional-reactive-smart-home.");

Hub.input
    .onValue(x => console.log(JSON.stringify({"input": x[0], "state": x[1]})));

Hub.output
    .onValue(x => console.log(JSON.stringify({"output": x})));
