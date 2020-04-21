const Hub = require('./hub');
const io = require("socket.io").listen(9090);

const broadcastToSocketClients = value => {
    io.sockets.emit("frs", value)
};

Hub.input
    .map(JSON.stringify)
    .onValue(broadcastToSocketClients);
