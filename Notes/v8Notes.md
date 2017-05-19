## V8 JavaScript Engine (Notes)

https://en.wikipedia.org/wiki/Chrome_V8

https://www.dynatrace.com/blog/understanding-garbage-collection-and-hunting-memory-leaks-in-node-js/

https://github.com/v8/v8/wiki/Introduction

https://github.com/v8/v8/wiki/Design-Elements

https://en.wikipedia.org/wiki/Inline_caching

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

** Fast Property Access

V8 doesn't use dynamic lookup for properties (like normal JS)! Creates hidden classes and then reuses them.

This allows it to use in-line caching: doesn't have to dynamically look up class method. cache it after first time.

https://nodesource.com/blog/profiling-node-js-applications/

