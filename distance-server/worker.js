const {threadId, parentPort, workerData} = require('worker_threads');
const message = workerData;
const axios = require('axios');
(async () => {
    try {
        console.log('message :', message);
        const response = await axios.get(`https://api.coinmarketcap.com/v2/ticker/${message}/`)
        parentPort.postMessage(JSON.stringify(response.data));
    }catch (e) {
        console.log('e :', e);
    }

})()
