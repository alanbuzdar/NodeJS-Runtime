// Node server that broadcasts all websocket messages to all clients
// docs https://github.com/websockets/ws/blob/master/doc/ws.md
const WebSocket = require('ws');
const cluster = require('cluster');
const cpu = require('os').cpus().length
if (cluster.isMaster) {
    cluster.schedulingPolicy = cluster.SCHED_RR;
    // One Process Per Core
    for(i=0; i<cpu; i++)
        cluster.fork();
}
else {
    const wss = new WebSocket.Server({ perMessageDeflate: false, port: 8080  });

    var connections = setInterval( function() {
    console.log(wss.clients.size);
    }, 5*1000);


}