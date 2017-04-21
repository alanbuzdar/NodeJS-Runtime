// Node server that broadcasts all websocket messages to all clients
// Code taken from example at: https://github.com/websockets/ws

const WebSocket = require('ws');

const wss = new WebSocket.Server({ perMessageDeflate: false, port: 8080,  });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(data) {
    // Broadcast to everyone else.
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });
});