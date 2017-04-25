// Node server that broadcasts all websocket messages to all clients
// docs https://github.com/websockets/ws/blob/master/doc/ws.md
const WebSocket = require('ws');

const wss = new WebSocket.Server({ perMessageDeflate: false, port: 8080  });

var connections = setInterval( function() {
  console.log(wss.clients.size);
}, 5*1000);

wss.on('connection', function connection(ws) {
    // Send keep alive messages. Close if no response.
    ws.keepAlive = false;
    var interval = setInterval(function() {
        if (ws.keepAlive) {
            ws.close();
        } else {
            ws.ping(null, null, true);
            ws.keepAlive = true;
        }
    }, 5*1000); // milliseconds between pings
    ws.on("pong", function() { 
        ws.keepAlive = false; 
    });

});