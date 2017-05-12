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