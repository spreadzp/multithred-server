const net = require('toa-net');
//const parser = require('./parser');
const auth = new net.Auth('secretxxx');
let client = null;
let idToken = 2540;

let clientHost, clientPort;

const server = new net.Server(function (socket) {
    socket.on('message', (message) => {
        console.log('message :', message);
        clientHost = message.payload.params[1];
        clientPort = message.payload.params[2];
        console.log(clientHost, clientPort);
        if (message.payload.message === 'responseOrder') {
            startClient({ serverPort: clientPort, host: clientHost });
        }
        if(clientHost && clientPort) {
            startClient({ serverPort: clientPort, host: clientHost });
        }
        
    })

})
server.listen(8000)

// Enable authentication for server
server.getAuthenticator = function () {
    return (signature) => auth.verify(signature)
}
/* server.on('responseOrder', (message) => {
    console.log('message1 :', message);
    clientHost = message.payload.params[0];
    clientPort = message.payload.params[1];
    console.log(clientHost, clientPort);
    startClient({ serverPort: clientPort, host: clientHost });
}) */
function createClient(clientSocket) {
    client = new net.Client()
    // Enable authentication for client
    client.getSignature = function () {
        return auth.sign({ id: 'clientIdxxx' })
    }
    client.connect(clientSocket);
}

/* function sendOrdersToBot(orders) {
    if (orders) {
        const arbitrageId = uniqid();
        console.log('arbitrageId :', arbitrageId);

        if (orders.seller !== undefined) {
            const parametersSellOrder = {
                serverPort: orders.seller.port, host: orders.seller.host,
                order: {
                    pair: orders.seller.pair, exchange: orders.seller.exchange, price: orders.seller.price,
                    volume: orders.seller.volume, typeOrder: 'sell', arbitrageId: arbitrageId, 
                    deviationPrice: orders.seller.deviationPrice
                }
            }
            startClient(parametersSellOrder);
        }
        if (orders.buyer !== undefined) {
            const parametersBuyOrder = {
                 orders.buyer.host,
                order: { pair: orders.buyer.pair, exchange: orders.buyer.exchange, price: orders.buyer.price,
                 volume: orders.buyer.volume, typeOrder: 'buy', arbitrageId: arbitrageId, 
                deviationPrice: orders.buyer.deviationPrice }
            }
            startClient(parametersBuyOrder);
        }

    }
} */

function startClient(order) {
    try {
        const clientSocket = `tcp://${order.host}:${order.serverPort}`;
        if (!client) {
            createClient(clientSocket);
        } 
        client.on('error', (err) => {
            //console.log('err.trace :', err); 
            if (err.code === 'ETIMEDOUT') {
                client.destroy();
            }
            clientReconnection(clientSocket)
        });
        client.notification('sendOrder', [`${idToken}`])
        idToken++;
        client.notification('message', [`${idToken}`])
        console.log('idToken :', idToken);
    } catch (e) {
        console.log('err :', e);

    }


    function clientReconnection(clientSocket) {
        client.reconnect();
        /* logger.log(`info`,
            `client.rpcCount= ${client.rpcCount}
                client.socket= ${client.socket}
                client.connected= ${client.connected}
                client.rpcCount= ${client.rpcCount}
                client.connectOptions= ${client.connectOptions}
                client.MAX_ATTEMPTS= ${client.MAX_ATTEMPTS}   
                `
        ); */
    }


}
