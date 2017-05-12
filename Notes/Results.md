testing locally on my Windows computer I am able to get 16317 connections with my custom client and server. This barely even affects the CPU at all. The error I get is ENOBUFS. This means it is failing to allocate memory for all the connections. (after this, my web browser cant even load pages)

--tried modifying send and recv buffers in registers as well as memory for node and no improvement 

**Deployed to AWS medium instance 4/28

Without any optimizations can handle 54k connections!

Did not improve with starting node with more memory, disabling incremental GC, or expanding file limit. (need to investigate why it couldn't handle more)

**Deployed in Cluster Mode 5/5

Running it on both cores allows me to get up to 70k+ connections simultaneously on an m3 medium server! (miscalculated earlier)

My main problem right now is not the server side but that the clients. Which get an "EADDRNOTAVAIL" error. Need to investigate.

EADDRNOTAVAIL has local port 0.

Server side still has surprisingly low CPU/Memory usage.

CPU usage spikes when connections established but falls greatly when just maintaining connections

EADDRNOTAVAIL usually happens when using port you're not allowed to.

Surprised to reach 70k+ connections so quickly without much load. 

I was going to use sticky sessions as mentioned in one tutorial but that isn't needed for WS websockets

Sticky sessions are only needed for Socket.io


##5/12 results

Found the cause behind EADDRNOTAVAIL. The client was running out of ports to use for its connections.

Fix was found at: http://www.toptip.ca/2010/02/linux-eaddrnotavail-address-not.html

Had to add echo "1024 65535" >/proc/sys/net/ipv4/ip_local_port_range which made the local port range much larger.

Reached 100k connections on first test after fixing client.

Each sub-process was hovering around 25% of CPU and 25% of memory usage

At a little above 100k connections, clients started getting: ECONNRESET messages.

### Second Run

Ran it again to see what happened and same thing happened at 100k again. Once that error happens it goes from 100k connections to only 20k.

perhaps the connections are being garbage collected?

### Third run

For this run, i increased I mad all 3 clients attempt to do 60k connections. This caused an error at 110k (so basically the same). 

The main difference with this test is my server actually failed this time and reached 100 CPU Usage.

Server Error:

_http_server.js:345
  var external = socket._handle._externalStream;
                               ^

TypeError: Cannot read property '_externalStream' of null
    at Server.connectionListener (_http_server.js:345:32)
    at emitOne (events.js:77:13)
    at Server.emit (events.js:169:7)
    at Object.onconnection (net.js:1433:8)
    at onconnection (cluster.js:652:26)
    at Worker.onmessage (cluster.js:533:9)
    at process.<anonymous> (cluster.js:714:8)
    at emitTwo (events.js:92:20)
    at process.emit (events.js:172:7)
    at handleMessage (internal/child_process.js:689:10)

Client Error: 

throw er; // Unhandled 'error' event
      ^

Error: read ECONNRESET
    at exports._errnoException (util.js:870:11)
    at TCP.onread (net.js:544:26)
events.js:141
      throw er; // Unhandled 'error' event

### Tried with 4 Workers instead (2 cores)

Experimented with the server using 4 workers instead of 2. This didn't help at all and failures still start at around 100 or 105k.

I noticed this time that for some reason one of the node processes uses 100 pct CPU at the time of failure while the others don't.

### Running without GC 

no change.

### Change keep alives to every 25 seconds instead of 5

failed at 115k. With error:

Error: socket hang up
    at createHangUpError (_http_client.js:202:15)
    at Socket.socketOnEnd (_http_client.js:287:23)
    at emitNone (events.js:72:20)
    at Socket.emit (events.js:166:7)
    at endReadableNT (_stream_readable.js:905:12)
    at nextTickCallbackWith2Args (node.js:441:9)
    at process._tickCallback (node.js:355:17)
events.js:141
      throw er; // Unhandled 'error' event


Switching from round-robin scheduling algorithm to OS default scheduling didnt help

### Getting rid of Keep-alives all-together

Getting rid of keep alives allowed me to get 125k connections before any errors. 

Once again, the error i got was "socket hang up".

One core had: 60839 connections

While other had: 65520 connections

To truly get to the bottom of the reason that can't get more connections I will need to find a better way to profile the performance.