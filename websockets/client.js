const WebSocket = require('ws');
var hasFailed = false;
for(var i=0; i<1000; i++) {
    const clientNum = i;
    const ws = new WebSocket('ws://localhost:8080', {
    perMessageDeflate: false
        });

    ws.onerror = function(error) {
        if(!hasFailed)
            console.log('failed on: ' + clientNum + error);
        hasFailed = true;
    }
    // ws.on('ping', function() {
    // });
}