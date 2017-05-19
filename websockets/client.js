// Client that uses clustering. This is for load testing my server and is run from
// multiple other sites. Remember to change IP value!

const WebSocket = require('ws');
const cluster = require('cluster');
const cpu = require('os').cpus().length
if (cluster.isMaster) {
    // One Process Per Core
    for(i=0; i<cpu; i++)
        cluster.fork();
}
else {
    var hasFailed = false;
    var ex = [];
    for(var i=0; i<30000; i++) {
        const clientNum = i;
        const ws = new WebSocket('ws://localhost:8080', {
        perMessageDeflate: false
            });

        ws.onerror = function(error) {
            if(!hasFailed && clientNum != 0)
                console.log('failed on: ' + clientNum + error);
            hasFailed = true;
        }

        ws.on('open', function() {
            // Send keep alive messages. Close if no response.
            ws.keepAlive = false;
            var interval = setInterval(function() {
                if (ws.keepAlive) {
                    ws.close();
                } else {
                    ws.ping(null, null, true);
                    ws.keepAlive = true;
                }
            }, 25*1000); // milliseconds between pings

        });
        ws.on("pong", function() { 
                ws.keepAlive = false; 
        });
        ex.push(ws);
        // ws.on('ping', function() {
        // });
    }
}