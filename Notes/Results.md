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

### Moving Keep-Alives to client

Moving keep-alive to client seems to use way less CPU on server side but still fails around 125k.

I tried running with just 1 core on server and it fails on 65223 connections. This is very similiar to the failure point of 1 of the two cores in cluster mode.

just realized 65536 is linux's max file descriptor count! might be the cause!

Apparently this was the issue. 

I had the right settings applied for my file descriptors but they didnt get applied until I actualyl exited the instance and ssh'd back in.

Got 100k connections on core (but turns out pings werent working right on client)

Moved handling back to server.

Got 150k connections with timeout of 10 seconds!

At that point I get a 'ETIMEDOUTERROR'

Changed Timeout to 25 seconds:

Once again at 150k, all the connections timeout for some reason. Prior to this, the CPU is only getting 25 pct usage, but after the timeout, it get's stuck at 100. (which maybe is just from haviung to close all the connections)

One interesting thing is the connections were split 90k/60k. Not evenly.

What i really need is for the CPU to use every cycle.

I discoverd the Node has a production mode.

I tried running it in prod mode and it ran much faster but still fails at 150k connections. This time they were evenly split.

### 5/25

The next step is to profile my node server to figure out what is going on.

I was able to profile my server using v8's profiler

The most interesting part for me was the following line:

 215851   63.2%   71.9%  epoll_pwait

 This shows that the most ticks are spent on the epoll_pwait syscall

 Investigating further it seems like most of what is taking the time is handling the pings for each client. I wonder if I can somehow do this more efficiently.

 ### I tried batching up my pings together instead of making them all have timers

 Unfortunately the code ran worse doing this and started failinga round 100k because sending pings to every client took so long that some would timeout

### Next compiled some of the libraries to raw C++ and was able to get up to 200k!

 Moving it back and using binary addons allowed me to get 200k connections! 

 I was able to debug the GC to see how it was working. Turns out my scavenging garbage collector was on:

[10334:0x169dd80] [I:0x169dd80]    92649 ms: pause=21.8 mutator=1313.0 gc=s external=0.1 mark=0.0 sweep=0.00 sweepns=0.00 sweepos=0.00 sweepcode=0.00 sweepcell=0.00 sweepmap=0.00 evacuate=0.0 new_new=0.0 root_new=0.0 old_new=0.0 compaction_ptrs=0.0 intracompaction_ptrs=0.0 misc_compaction=0.0 weak_closure=0.0 inc_weak_closure=0.0 weakcollection_process=0.0 weakcollection_clear=0.0 weakcollection_abort=0.0 total_size_before=196867520 total_size_after=187883992 holes_size_before=1384928 holes_size_after=1255080 allocated=14305120 promoted=3222696 semi_space_copied=4303872 nodes_died_in_new=608 nodes_copied_in_new=605 nodes_promoted=389 promotion_ratio=19.5% average_survival_ratio=46.1% promotion_rate=99.0% semi_space_copy_rate=26.1% new_space_allocation_throughput=7312 context_disposal_rate=0.0 steps_count=193 steps_took=51.7 scavenge_throughput=824797

As you can see, the promotion rate is really high

https://gist.github.com/listochkin/10973974

Also the scavenger GC is running extremely often:

[10407:0x1c64e10]   158576 ms: Scavenge 263.9 (342.2) -> 263.4 (342.2) MB, 14.8 / 0 ms [allocation failure].
[10407:0x1c64e10]   158704 ms: Scavenge 264.1 (342.2) -> 263.5 (342.2) MB, 14.7 / 0 ms [allocation failure].

turning off scavenger.

it seems the Mark-sweep GC is running fairly often as well. Usually only takes 4ms but a few times it took 700+ ms.

AFter changing GC settings I am able to get 256k connections!