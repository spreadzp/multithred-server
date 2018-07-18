const net = require("toa-net");
const { Worker, workerData } = require('worker_threads');
const auth = new net.Auth("secretxxx");
const serverPort = Math.floor(Math.random() * 10000) + 10000;
const URL_SERVER = "tcp://localhost:8000",
    URL_BOT_SERVER = "localhost";


const server = new net.Server(function (socket) {
    startServerConnection(socket);
    server.on("error", () => {
        startServerConnection(socket);
    });
});

function startServerConnection(socket) {
    console.log('socket :', socket);
    socket.on("message", message => {
        let fulfill = false;
        console.log(`@@@@@@@@@ ${message.payload.params}`)
        //const newOrder = JSON.parse(message.payload.params);
        if (message.type === "request") {
            // echo request
            socket.success(message.payload.id, message.payload.params);
        }
        console.log('!!!!!!!!!!!!!!!!!!!!!!!) = ');
        receiveInfo(message.payload.params);
    });
    console.log('socket :', socket);
}
/* server.on("message", message => {
    console.log('message from Main Server :', message);
}) */

function listenServer() {
    console.log("server trying to connect url :", URL_BOT_SERVER, serverPort);
    server.listen(serverPort);
}
listenServer();
server.on("error", () => {
    setTimeout(() => listenServer(), 2000);
});

// Enable authentication for server
server.getAuthenticator = function () {
    return signature => auth.verify(signature);
};

const client = new net.Client();
// Enable authentication for client
client.getSignature = function () {
    return auth.sign({ id: "clientIdxxx" });
};

function startConnection(message) {
    console.log(message);
    client.connect(URL_SERVER);
}

client.on("error", () => {
    client.connected = false;
    client.reconnect();
});
if (!client.connected) {
    startConnection(" client connecting....");
}

client.notification("nameForSocket", [
    "",
    URL_BOT_SERVER,
    serverPort
]);

function receiveInfo(info) {
    const worker = new Worker(__dirname + '/worker.js', { workerData: info });
    listeners(worker);
}


function listeners(object) {
    object.on('online', () => {
        console.log('Worker ready');
    });

    object.on('message', (msg) => {
        client.notification('responseOrder', [
            {
                arbitrageId: msg,
            },
            URL_BOT_SERVER,
            serverPort
        ]);
        console.log('Worker message:', JSON.parse(msg));
    });

    object.on('error', (err) => {
        console.error('Worker error:', err);
    });

    object.on('exit', (code) => {
        console.log('Worker exit code:', code); 
    });
}

