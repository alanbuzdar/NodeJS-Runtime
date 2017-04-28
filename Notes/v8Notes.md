## V8 JavaScript Engine (Notes)

https://en.wikipedia.org/wiki/Chrome_V8

https://www.dynatrace.com/blog/understanding-garbage-collection-and-hunting-memory-leaks-in-node-js/

Compiles JS directly to machine code before execution

Uses an incremental generational garbage collector. 

** Generational Garbage Collection

Seperate different aged objects by memory region

When a region is full, trace it  using older generation as roots. 

Can promote survivors to higher generation.

** V8 GC

Actually two types of GC used:

Scavenge (which is the Generational One)

Mark-Sweep (Less frequent but stop-the-world)

