const WebSocket = require('ws');
var hasFailed = false;
for(var i=0; i<10000; i++) {
    const clientNum = i;
    const ws = new WebSocket('ws://localhost:8080', {
    perMessageDeflate: false
        });

    ws.on('error', function(error) {
        if(!hasFailed)
            console.log('failed on: ' + clientNum + error);
        hasFailed = true;
    });
    // ws.on('ping', function() {
    // });
}