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
    const wss = new WebSocket.Server({ perMessageDeflate: false, port: 8080, keepalive: true });
    var clients = [];
    var index = 0;
    var connections = setInterval( function() {
    console.log(wss.clients.size);
    }, 5*1000);

    var pings = setInterval( function() {
        var start = index;
        for(var i=0; i<500; i++) {
                var toPing = clients[(index+i)%clients.length];
                if(toPing != null) toPing.ping(null,null,true);        
        }
        index += 500;
    }, 5*10);

    wss.on('error', function(error) {
            console.log(error);
    });

    wss.on('connection', function connection(ws) {
    // Send keep alive messages. Close if no response.
/*            var interval = setInterval(function() {
                    ws.ping(null, null, true);
            }, 10*1000); // milliseconds between pings      
            */
            clients.push(ws);  
    }); 
}