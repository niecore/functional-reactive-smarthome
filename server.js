const Kefir = require("kefir");
const Hub = require('./hub');
const io = require("socket.io").listen(9090);

const broadcastToSocketClients = value => {
    io.sockets.emit("frs", value)
};

const currentValue = Hub.input.toProperty();

io.on('connection', (socket) => {

    // broadcast initial value
    currentValue.take(1).onValue(value => socket.emit("frs", JSON.stringify(value)));

    socket.on("frs", (msg) => {
        Hub.output.plug(Kefir.constant(JSON.parse(msg)));
    });
});

Hub.input
    .map()
    .onValue(broadcastToSocketClients);
