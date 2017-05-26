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
    require('events').EventEmitter.prototype._maxListeners = 0;
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

        // ws.on('ping', function() {
        //     console.log("got ping");
        // });
    }
}