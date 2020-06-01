const Kefir = require("kefir");
const Hub = require('./hub');
const io = require("socket.io").listen(9090);

const HubProperty = Hub.input.toProperty();
const broadcastToSocketClient = socket => value => socket.emit("frs", value);

io.on('connection', (socket) => {
    // input
    HubProperty
        .map(JSON.stringify)
        .onValue(broadcastToSocketClient(socket));

    // output
    socket.on("frs", (msg) => {
        Hub.output.plug(Kefir.constant(JSON.parse(msg)));
    });
});

