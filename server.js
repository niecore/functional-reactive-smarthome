const Kefir = require("kefir");
const Hub = require('./hub');
const io = require("socket.io").listen(9090);

const broadcastToSocketClients = value => {
    io.sockets.emit("frs", value)
};

const input = new Kefir.pool();

io.on('connection', (socket) => {
    socket.on("frs", (msg) => {
        Hub.output.plug(Kefir.constant(JSON.parse(msg)));
    });
});



Hub.input
    .map(JSON.stringify)
    .onValue(broadcastToSocketClients);
