testing locally on my Windows computer I am able to get 16317 connections with my custom client and server. This barely even affects the CPU at all. The error I get is ENOBUFS. This means it is failing to allocate memory for all the connections. (after this, my web browser cant even load pages)

--tried modifying send and recv buffers in registers as well as memory for node and no improvement 

**Deployed to AWS medium instance 4/28

Without any optimizations can handle 54k connections!

Did not improve with starting node with more memory, disabling incremental GC, or expanding file limit. (need to investigate why it couldn't handle more)